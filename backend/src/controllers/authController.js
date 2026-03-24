const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { User, Referral, Commission, Product, Order } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// 用户注册
exports.register = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { username, password, phone, email, nickname, referralCode } = req.body;

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({
        code: 400,
        message: '用户名已存在'
      });
    }

    // 如果提供了推荐码，查找推荐人
    let referrerId = null;
    if (referralCode) {
      const referrer = await User.findOne({ 
        where: { referralCode, status: 1 } 
      });
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // 创建用户
    const user = await User.create({
      username,
      passwordHash: password, // beforeCreate 钩子会自动加密
      phone,
      email,
      nickname,
      referrerId,
      referralCode: User.generateReferralCode(),
      status: 1
    }, { transaction });

    // 如果有推荐人，创建分销关系
    if (referrerId) {
      // 创建直接下级关系（level 1）
      await Referral.create({
        referrerId,
        refereeId: user.id,
        level: 1,
        path: `${referrerId}/${user.id}`
      }, { transaction });

      // 递归创建间接关系（最多 3 级）
      await createIndirectReferrals(referrerId, user.id, transaction);
    }

    // 生成二维码（base64 格式）
    const qrCodeBase64 = await generateQRCodeBase64(user);
    user.qrCodeUrl = qrCodeBase64;
    await user.save({ transaction });

    await transaction.commit();

    // 生成 token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      code: 200,
      message: '注册成功',
      data: {
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          phone: user.phone,
          email: user.email,
          avatarUrl: user.avatarUrl,
          referralCode: user.referralCode,
          qrCodeUrl: user.qrCodeUrl,
          balance: user.balance,
          totalCommission: user.totalCommission
        },
        token
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('注册失败:', error);
    res.status(500).json({
      code: 500,
      message: '注册失败',
      error: error.message
    });
  }
};

// 创建间接分销关系
async function createIndirectReferrals(referrerId, newUserId, transaction, level = 1, path = '') {
  const maxLevels = parseInt(process.env.MAX_COMMISSION_LEVELS) || 3;
  
  if (level >= maxLevels) {
    return;
  }

  // 查找推荐人的所有上级
  const referrerRelations = await Referral.findAll({
    where: { refereeId: referrerId },
    include: [{
      model: User,
      as: 'referrer',
      attributes: ['id', 'username']
    }]
  }, { transaction });

  for (const relation of referrerRelations) {
    const upperReferrerId = relation.referrerId;
    const newLevel = level + 1;
    const newPath = relation.path ? `${relation.path}/${newUserId}` : `${upperReferrerId}/${newUserId}`;

    await Referral.create({
      referrerId: upperReferrerId,
      refereeId: newUserId,
      level: newLevel,
      path: newPath
    }, { transaction });

    // 递归处理更上级
    await createIndirectReferrals(upperReferrerId, newUserId, transaction, newLevel, newPath);
  }
}

// 生成用户二维码（返回 base64 编码）
async function generateQRCodeBase64(user) {
  // 二维码内容：移动端前端地址 + 推荐码
  // 使用 Vercel 部署的移动端地址
  const frontendUrl = process.env.FRONTEND_URL || 'https://distribution-system-psi.vercel.app';
  const registerUrl = `${frontendUrl}/register?ref=${user.referralCode}`;
  
  console.log(`为用户 ${user.username} 生成二维码，注册链接：${registerUrl}`);
  
  // 生成 base64 编码的 PNG
  const qrCodeDataUrl = await QRCode.toDataURL(registerUrl, {
    width: 300,
    margin: 2
  });
  
  return qrCodeDataUrl; // data:image/png;base64,...
}

// 用户登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ 
      where: { username }
    });

    if (!user || user.status !== 1) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      });
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      });
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date();
    await user.save();

    // 生成 token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      code: 500,
      message: '登录失败',
      error: error.message
    });
  }
};

// 获取当前用户信息
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['passwordHash'] }
    });

    // 如果用户没有二维码，自动生成（base64 格式）
    if (!user.qrCodeUrl || !user.qrCodeUrl.startsWith('data:')) {
      console.log(`用户 ${user.id} 没有二维码，正在生成...`);
      const qrCodeBase64 = await generateQRCodeBase64(user);
      user.qrCodeUrl = qrCodeBase64;
      await user.save();
      console.log(`用户 ${user.id} 二维码生成成功`);
    }

    res.json({
      code: 200,
      data: { user }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取用户信息失败',
      error: error.message
    });
  }
};

// 更新用户信息
exports.updateProfile = async (req, res) => {
  try {
    const { nickname, phone, email, avatarUrl } = req.body;
    const user = await User.findByPk(req.user.id);

    if (nickname) user.nickname = nickname;
    if (phone) user.phone = phone;
    if (email) user.email = email;
    if (avatarUrl) user.avatarUrl = avatarUrl;

    await user.save();

    res.json({
      code: 200,
      message: '更新成功',
      data: { user }
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新用户信息失败',
      error: error.message
    });
  }
};

// 修改密码
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    // 验证旧密码
    const isValid = await user.validatePassword(oldPassword);
    if (!isValid) {
      return res.status(400).json({
        code: 400,
        message: '原密码错误'
      });
    }

    // 验证新密码长度
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        code: 400,
        message: '密码至少 6 位'
      });
    }

    // 更新密码
    user.passwordHash = newPassword; // beforeUpdate 钩子会自动加密
    await user.save();

    res.json({
      code: 200,
      message: '密码修改成功，请重新登录'
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({
      code: 500,
      message: '修改密码失败',
      error: error.message
    });
  }
};

// 上传头像（返回 base64，避免文件存储问题）
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请选择要上传的图片'
      });
    }

    // 将文件转换为 base64
    const imageBuffer = req.file.buffer;
    const base64String = imageBuffer.toString('base64');
    const avatarUrl = `data:${req.file.mimetype};base64,${base64String}`;

    console.log(`头像上传成功，大小：${req.file.size} 字节`);

    res.json({
      code: 200,
      message: '上传成功',
      data: {
        url: avatarUrl,
        filename: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('上传头像失败:', error);
    res.status(500).json({
      code: 500,
      message: '上传头像失败',
      error: error.message
    });
  }
};

// 获取我的下级列表
exports.getReferees = async (req, res) => {
  try {
    const { level = 1, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Referral.findAndCountAll({
      where: {
        referrerId: req.user.id,
        level: parseInt(level)
      },
      include: [{
        model: User,
        as: 'referee',
        attributes: ['id', 'username', 'nickname', 'avatarUrl', 'phone', 'created_at']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      code: 200,
      data: {
        list: rows.map(r => r.referee),
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取下级列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取下级列表失败',
      error: error.message
    });
  }
};

// 获取我的佣金记录
exports.getCommissions = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Commission.findAndCountAll({
      where,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNo', 'status', 'actualAmount', 'created_at']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'mainImage']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      code: 200,
      data: {
        list: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取佣金记录失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取佣金记录失败',
      error: error.message
    });
  }
};

// 获取分销统计
exports.getReferralStats = async (req, res) => {
  try {
    // 直接下级数量
    const directCount = await Referral.count({
      where: { referrerId: req.user.id, level: 1 }
    });

    // 间接下级数量
    const indirectCount = await Referral.count({
      where: { referrerId: req.user.id, level: { [Op.gt]: 1 } }
    });

    // 佣金统计
    const { fn, col } = require('sequelize');
    const commissionStats = await Commission.findAll({
      where: { userId: req.user.id },
      attributes: [
        'status',
        [fn('SUM', col('amount')), 'totalAmount'],
        [fn('COUNT', col('id')), 'totalCount']
      ],
      group: ['status']
    });

    const stats = {
      directReferees: directCount,
      indirectReferees: indirectCount,
      totalReferees: directCount + indirectCount,
      commissions: {
        pending: 0,
        frozen: 0,      // 冻结中（收货后 15 天内）
        confirmed: 0,   // 可提现（已过 15 天）
        paid: 0,        // 已提现
        total: 0
      }
    };

    commissionStats.forEach(stat => {
      const status = stat.getDataValue('status');
      const amount = parseFloat(stat.getDataValue('totalAmount') || 0);
      if (stats.commissions[status] !== undefined) {
        stats.commissions[status] = amount;
      }
      stats.commissions.total += amount;
    });

    res.json({
      code: 200,
      data: { stats }
    });
  } catch (error) {
    console.error('获取分销统计失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取分销统计失败',
      error: error.message
    });
  }
};

// 获取下级订单统计
exports.getRefereeOrderStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { fn, col } = require('sequelize');

    // 验证该用户是否是我的下级
    const isReferee = await Referral.findOne({
      where: {
        referrerId: req.user.id,
        refereeId: userId
      }
    });

    if (!isReferee) {
      return res.status(403).json({
        code: 403,
        message: '无权查看该用户信息'
      });
    }

    // 查询订单统计
    const orderStats = await Order.findOne({
      where: { userId },
      attributes: [
        [fn('COUNT', col('id')), 'totalCount'],
        [fn('SUM', col('actual_amount')), 'totalAmount']
      ]
    });

    // 查询佣金统计（该用户获得的所有佣金）
    const commissionStats = await Commission.findOne({
      where: { userId },
      attributes: [
        [fn('SUM', col('amount')), 'totalCommission']
      ]
    });

    const totalCount = parseInt(orderStats?.getDataValue('totalCount') || 0);
    const totalAmount = parseFloat(orderStats?.getDataValue('totalAmount') || 0).toFixed(2);
    const commissionAmount = parseFloat(commissionStats?.getDataValue('totalCommission') || 0).toFixed(2);

    res.json({
      code: 200,
      data: {
        stats: {
          totalCount,
          totalAmount,
          commissionAmount
        }
      }
    });
  } catch (error) {
    console.error('获取下级订单统计失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取下级订单统计失败',
      error: error.message
    });
  }
};
