const { User, Product, Order, OrderItem, Commission, Referral, CommissionPayment } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// 获取数据统计概览
exports.getDashboard = async (req, res) => {
  try {
    // 用户统计
    const totalUsers = await User.count({ where: { status: 1 } });
    const newUsersToday = await User.count({
      where: {
        status: 1,
        created_at: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    // 订单统计
    const totalOrders = await Order.count();
    const todayOrders = await Order.count({
      where: {
        created_at: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    // 销售金额统计（统计已支付、已发货、已完成的订单）
    const totalSales = await Order.sum('actual_amount', {
      where: { 
        status: { [Op.in]: ['paid', 'shipped', 'completed'] } 
      }
    });
    const todaySales = await Order.sum('actual_amount', {
      where: {
        status: { [Op.in]: ['paid', 'shipped', 'completed'] },
        created_at: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    // 佣金统计
    const totalCommissions = await Commission.sum('amount', {
      where: { status: 'paid' }
    });
    const pendingCommissions = await Commission.sum('amount', {
      where: { status: { [Op.in]: ['pending', 'confirmed'] } }
    });

    // 商品统计（统计上架的商品）
    const totalProducts = await Product.count({ 
      where: { 
        status: 1 
      },
      paranoid: true // 只统计未删除的商品
    });

    res.json({
      code: 200,
      data: {
        users: {
          total: totalUsers,
          newToday: newUsersToday
        },
        orders: {
          total: totalOrders,
          today: todayOrders
        },
        sales: {
          total: parseFloat(totalSales || 0),
          today: parseFloat(todaySales || 0)
        },
        commissions: {
          paid: parseFloat(totalCommissions || 0),
          pending: parseFloat(pendingCommissions || 0)
        },
        products: {
          total: totalProducts
        }
      }
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取统计数据失败',
      error: error.message
    });
  }
};

// 获取用户列表
exports.getUserList = async (req, res) => {
  try {
    const { status, isAdmin, page = 1, limit = 20, keyword } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status !== undefined) {
      where.status = parseInt(status);
    }
    if (isAdmin !== undefined) {
      where.isAdmin = parseInt(isAdmin);
    }
    if (keyword) {
      where[Op.or] = [
        { username: { [Op.like]: `%${keyword}%` } },
        { nickname: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['passwordHash'] },
      include: [{
        model: User,
        as: 'referrer',
        attributes: ['id', 'username', 'nickname']
      }],
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
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取用户列表失败',
      error: error.message
    });
  }
};

// 获取分销关系图
// 获取佣金列表
exports.getCommissionList = async (req, res) => {
  try {
    const { status, userId, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (userId) {
      where.userId = userId;
    }

    const { count, rows } = await Commission.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'nickname']
        },
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNo', 'status', 'actualAmount']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name']
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
    console.error('获取佣金列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取佣金列表失败',
      error: error.message
    });
  }
};

// 发放佣金
exports.payCommissions = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { commissionIds } = req.body;
    const adminId = req.user.id;

    if (!commissionIds || !Array.isArray(commissionIds) || commissionIds.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        code: 400,
        message: '请选择要发放的佣金'
      });
    }

    // 获取佣金记录（只允许发放已确认的佣金）
    const commissions = await Commission.findAll({
      where: {
        id: commissionIds,
        status: 'confirmed'  // 只有 confirmed 状态才能发放
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'balance']
      }],
      transaction
    });

    if (commissions.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        code: 400,
        message: '没有可发放的佣金'
      });
    }

    // 按用户分组
    const userCommissions = new Map();
    let totalAmount = 0;

    for (const commission of commissions) {
      const userId = commission.userId;
      if (!userCommissions.has(userId)) {
        userCommissions.set(userId, []);
      }
      userCommissions.get(userId).push(commission);
      totalAmount += parseFloat(commission.amount);
    }

    // 创建发放记录并更新佣金状态
    const payment = await CommissionPayment.create({
      paymentNo: `PAY${Date.now()}`,
      userId: adminId, // 管理员操作
      totalAmount,
      commissionIds: commissionIds,
      status: 'completed'
    }, { transaction });

    // 更新佣金状态并发放
    for (const [userId, userComms] of userCommissions) {
      const userTotal = userComms.reduce((sum, c) => sum + parseFloat(c.amount), 0);

      // 更新佣金状态
      await Commission.update(
        {
          status: 'paid',
          paidAt: new Date()
        },
        {
          where: { id: userComms.map(c => c.id) },
          transaction
        }
      );

      // 更新用户余额
      await User.update(
        {
          balance: sequelize.literal(`balance + ${userTotal}`),
          totalCommission: sequelize.literal(`total_commission + ${userTotal}`)
        },
        {
          where: { id: userId },
          transaction
        }
      );
    }

    await transaction.commit();

    res.json({
      code: 200,
      message: '佣金发放成功',
      data: { payment }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('发放佣金失败:', error);
    res.status(500).json({
      code: 500,
      message: '发放佣金失败',
      error: error.message
    });
  }
};

// 获取佣金发放记录
exports.getPaymentRecords = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }

    const { count, rows } = await CommissionPayment.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'nickname']
      }],
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
    console.error('获取发放记录失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取发放记录失败',
      error: error.message
    });
  }
};

// 获取订单列表（管理后台）
exports.getOrderList = async (req, res) => {
  try {
    const { status, userId, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (userId) {
      where.userId = userId;
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'nickname', 'phone']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'mainImage']
          }]
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
    console.error('获取订单列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取订单列表失败',
      error: error.message
    });
  }
};

// 更新订单状态
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, receiverName, receiverPhone, receiverAddress, trackingNo, shippingCompany } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在'
      });
    }

    // 状态流转验证
    const validTransitions = {
      'pending': ['paid', 'cancelled'],
      'paid': ['shipped'],
      'shipped': ['completed'],
      'completed': [],
      'cancelled': [],
      'refunded': []
    };

    if (status && !validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        code: 400,
        message: `订单状态不能从 ${order.status} 变更为 ${status}`
      });
    }

    // 更新订单状态
    if (status) {
      order.status = status;
      
      // 如果确认支付，更新支付时间
      if (status === 'paid') {
        order.paymentTime = new Date();
      }
      
      // 如果发货，更新发货时间和物流信息
      if (status === 'shipped') {
        order.shippedAt = new Date();
        if (shippingCompany) order.shippingCompany = shippingCompany;
        if (trackingNo) order.trackingNo = trackingNo;
      }
      
      // 如果完成订单，更新完成时间
      if (status === 'completed') {
        order.completedAt = new Date();
      }
    }

    // 更新收货信息
    if (receiverName) order.receiverName = receiverName;
    if (receiverPhone) order.receiverPhone = receiverPhone;
    if (receiverAddress) order.receiverAddress = receiverAddress;

    await order.save();

    res.json({
      code: 200,
      message: '订单状态更新成功',
      data: { order }
    });
  } catch (error) {
    console.error('更新订单状态失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新订单状态失败',
      error: error.message
    });
  }
};

// 获取订单详情
exports.getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'nickname', 'phone', 'email']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'mainImage', 'currentPrice']
          }]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在'
      });
    }

    res.json({
      code: 200,
      data: { order }
    });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取订单详情失败',
      error: error.message
    });
  }
};

// 更新系统配置
exports.updateConfig = async (req, res) => {
  try {
    const { configKey, configValue } = req.body;

    // 这里可以添加 SystemConfig 模型
    // 简化处理，直接返回成功
    res.json({
      code: 200,
      message: '配置更新成功'
    });
  } catch (error) {
    console.error('更新配置失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新配置失败',
      error: error.message
    });
  }
};

// ==================== 商品管理 ====================

// 获取商品列表（只显示未删除的商品）
exports.getProductList = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status !== undefined && status !== '') {
      where.status = parseInt(status);
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
      // paranoid 默认为 true，会自动过滤已删除的商品
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
    console.error('获取商品列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取商品列表失败',
      error: error.message
    });
  }
};

// 获取商品详情
exports.getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        code: 404,
        message: '商品不存在'
      });
    }

    res.json({
      code: 200,
      data: { product }
    });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取商品详情失败',
      error: error.message
    });
  }
};

// 创建商品
exports.createProduct = async (req, res) => {
  try {
    const { name, description, currentPrice, originalPrice, commissionType, commissionValue, stock, mainImage, images } = req.body;

    const product = await Product.create({
      name,
      description,
      currentPrice,
      originalPrice: originalPrice || currentPrice,
      commissionType,
      commissionValue,
      stock: stock || 0,
      mainImage,
      images: images ? (Array.isArray(images) ? images.join(',') : images) : null,
      status: 1
    });

    res.status(201).json({
      code: 200,
      message: '商品创建成功',
      data: { product }
    });
  } catch (error) {
    console.error('创建商品失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建商品失败',
      error: error.message
    });
  }
};

// 更新商品
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        code: 404,
        message: '商品不存在'
      });
    }

    // 允许更新的字段
    const allowedFields = ['name', 'description', 'currentPrice', 'originalPrice', 'commissionType', 'commissionValue', 'stock', 'mainImage', 'images', 'status'];
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        product[field] = updates[field];
      }
    }

    // 处理 images 数组转字符串
    if (updates.images && Array.isArray(updates.images)) {
      product.images = updates.images.join(',');
    }

    await product.save();

    res.json({
      code: 200,
      message: '商品更新成功',
      data: { product }
    });
  } catch (error) {
    console.error('更新商品失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新商品失败',
      error: error.message
    });
  }
};

// 快速切换商品状态
exports.toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        code: 404,
        message: '商品不存在'
      });
    }

    if (status !== 0 && status !== 1) {
      return res.status(400).json({
        code: 400,
        message: '状态必须是 0 或 1'
      });
    }

    product.status = status;
    await product.save();

    res.json({
      code: 200,
      message: `商品已${status === 1 ? '上架' : '下架'}`,
      data: { product }
    });
  } catch (error) {
    console.error('切换商品状态失败:', error);
    res.status(500).json({
      code: 500,
      message: '切换商品状态失败',
      error: error.message
    });
  }
};

// 删除商品（软删除，移入回收站）
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        code: 404,
        message: '商品不存在'
      });
    }

    // 软删除：使用 destroy 但不 force，会设置 deletedAt
    await product.destroy();

    res.json({
      code: 200,
      message: '商品已移入回收站'
    });
  } catch (error) {
    console.error('删除商品失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除商品失败',
      error: error.message
    });
  }
};

// 图片上传
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请选择要上传的图片'
      });
    }

    // 构建访问 URL
    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      code: 200,
      message: '上传成功',
      data: {
        url: imageUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('上传图片失败:', error);
    res.status(500).json({
      code: 500,
      message: '上传图片失败',
      error: error.message
    });
  }
};

// ==================== 回收站管理 ====================

// 获取回收站商品列表
exports.getRecycledProducts = async (req, res) => {
  try {
    // 使用 paranoid: false 来获取已软删除的记录
    const products = await Product.findAll({
      where: {
        deletedAt: { [Op.ne]: null } // 只获取已删除的
      },
      paranoid: false,
      order: [['deleted_at', 'DESC']]
    });

    res.json({
      code: 200,
      data: {
        list: products
      }
    });
  } catch (error) {
    console.error('获取回收站商品失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取回收站商品失败',
      error: error.message
    });
  }
};

// 恢复单个商品
exports.restoreProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, { paranoid: false });
    if (!product) {
      return res.status(404).json({
        code: 404,
        message: '商品不存在'
      });
    }

    // 恢复商品：设置 deletedAt 为 null，status 设为 1（上架）
    product.deletedAt = null;
    product.status = 1;
    await product.save();

    res.json({
      code: 200,
      message: '商品已恢复',
      data: { product }
    });
  } catch (error) {
    console.error('恢复商品失败:', error);
    res.status(500).json({
      code: 500,
      message: '恢复商品失败',
      error: error.message
    });
  }
};

// 彻底删除单个商品
exports.deleteProductForever = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, { paranoid: false });
    if (!product) {
      return res.status(404).json({
        code: 404,
        message: '商品不存在'
      });
    }

    // 彻底删除：使用 destroy 并传入 force: true
    await product.destroy({ force: true });

    res.json({
      code: 200,
      message: '商品已彻底删除'
    });
  } catch (error) {
    console.error('彻底删除商品失败:', error);
    res.status(500).json({
      code: 500,
      message: '彻底删除商品失败',
      error: error.message
    });
  }
};

// 批量恢复商品
exports.batchRestore = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请选择要恢复的商品'
      });
    }

    const products = await Product.findAll({
      where: { id: ids },
      paranoid: false
    });

    if (products.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '未找到要恢复的商品'
      });
    }

    // 批量恢复
    await Product.update(
      {
        deletedAt: null,
        status: 1
      },
      {
        where: { id: ids },
        paranoid: false
      }
    );

    res.json({
      code: 200,
      message: `成功恢复 ${products.length} 个商品`
    });
  } catch (error) {
    console.error('批量恢复商品失败:', error);
    res.status(500).json({
      code: 500,
      message: '批量恢复商品失败',
      error: error.message
    });
  }
};

// 批量彻底删除商品
exports.batchDeleteForever = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请选择要彻底删除的商品'
      });
    }

    const products = await Product.findAll({
      where: { id: ids },
      paranoid: false
    });

    if (products.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '未找到要删除的商品'
      });
    }

    // 批量彻底删除
    await Product.destroy({
      where: { id: ids },
      force: true // 强制物理删除
    });

    res.json({
      code: 200,
      message: `成功彻底删除 ${products.length} 个商品`
    });
  } catch (error) {
    console.error('批量彻底删除商品失败:', error);
    res.status(500).json({
      code: 500,
      message: '批量彻底删除商品失败',
      error: error.message
    });
  }
};

// ==================== 分销关系树 ====================

// 获取分销关系树
exports.getReferralTree = async (req, res) => {
  try {
    // 获取所有用户及其上级关系
    const users = await User.findAll({
      attributes: ['id', 'username', 'nickname', 'phone', 'referrerId', 'created_at']
    });

    // 构建树形结构
    const userMap = new Map();
    users.forEach(user => {
      const userData = user.toJSON();
      userData.children = [];
      userMap.set(user.id, userData);
    });

    const tree = [];

    userMap.forEach((user, id) => {
      if (user.referrerId) {
        const parent = userMap.get(user.referrerId);
        if (parent) {
          parent.children.push(user);
        } else {
          tree.push(user);
        }
      } else {
        tree.push(user);
      }
    });

    res.json({
      code: 200,
      data: { tree }
    });
  } catch (error) {
    console.error('获取分销关系树失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取分销关系树失败',
      error: error.message
    });
  }
};

// 获取用户的下级列表（包含多级）
exports.getUserDownlines = async (req, res) => {
  try {
    const { userId } = req.params;
    const { maxLevel = 3 } = req.query;

    const downlines = await Referral.findAll({
      where: {
        referrerId: userId,
        level: { [Op.lte]: parseInt(maxLevel) }
      },
      include: [{
        model: User,
        as: 'referee',
        attributes: ['id', 'username', 'nickname', 'phone', 'referrerId', 'created_at']
      }],
      order: [['level', 'ASC'], ['created_at', 'DESC']]
    });

    res.json({
      code: 200,
      data: {
        list: downlines.map(r => ({
          level: r.level,
          path: r.path,
          user: r.referee
        }))
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
