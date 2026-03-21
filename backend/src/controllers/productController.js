const { Product, Order, OrderItem, Commission, User, Referral } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// 获取商品列表（默认只返回上架商品）
exports.getProducts = async (req, res) => {
  try {
    const { status, isHot, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // 默认只查询上架商品（status=1）
    const where = { status: 1 };
    
    // 如果明确传递了 status 参数，则使用传递的值
    if (status !== undefined) {
      where.status = parseInt(status);
    }
    if (isHot !== undefined) {
      where.isHot = parseInt(isHot);
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['isHot', 'DESC'], ['id', 'DESC']]
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

// 创建商品（管理员）
exports.createProduct = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      name,
      description,
      mainImage,
      images,
      originalPrice,
      currentPrice,
      costPrice,
      stock,
      commissionType,
      commissionValue,
      commissionLevels,
      isHot
    } = req.body;

    const product = await Product.create({
      name,
      description,
      mainImage,
      images,
      originalPrice,
      currentPrice,
      costPrice,
      stock,
      commissionType,
      commissionValue,
      commissionLevels,
      isHot: isHot ? 1 : 0,
      status: 1
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      code: 200,
      message: '商品创建成功',
      data: { product }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('创建商品失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建商品失败',
      error: error.message
    });
  }
};

// 更新商品（管理员）
exports.updateProduct = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      await transaction.rollback();
      return res.status(404).json({
        code: 404,
        message: '商品不存在'
      });
    }

    const {
      name,
      description,
      mainImage,
      images,
      originalPrice,
      currentPrice,
      costPrice,
      stock,
      commissionType,
      commissionValue,
      commissionLevels,
      isHot,
      status
    } = req.body;

    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (mainImage !== undefined) product.mainImage = mainImage;
    if (images !== undefined) product.images = images;
    if (originalPrice !== undefined) product.originalPrice = originalPrice;
    if (currentPrice !== undefined) product.currentPrice = currentPrice;
    if (costPrice !== undefined) product.costPrice = costPrice;
    if (stock !== undefined) product.stock = stock;
    if (commissionType) product.commissionType = commissionType;
    if (commissionValue !== undefined) product.commissionValue = commissionValue;
    if (commissionLevels !== undefined) product.commissionLevels = commissionLevels;
    if (isHot !== undefined) product.isHot = isHot ? 1 : 0;
    if (status !== undefined) product.status = status;

    await product.save({ transaction });
    await transaction.commit();

    res.json({
      code: 200,
      message: '商品更新成功',
      data: { product }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('更新商品失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新商品失败',
      error: error.message
    });
  }
};

// 删除商品（管理员）
exports.deleteProduct = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      await transaction.rollback();
      return res.status(404).json({
        code: 404,
        message: '商品不存在'
      });
    }

    // 软删除：设置为下架状态
    product.status = 0;
    await product.save({ transaction });

    await transaction.commit();

    res.json({
      code: 200,
      message: '商品已下架'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('删除商品失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除商品失败',
      error: error.message
    });
  }
};

// 创建订单
exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { items, receiverName, receiverPhone, receiverAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        code: 400,
        message: '请选择商品'
      });
    }

    // 查找用户信息（获取上级）
    const user = await User.findByPk(userId);
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    // 计算订单金额
    let totalAmount = 0;
    let totalCommission = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction });
      if (!product || product.status !== 1) {
        await transaction.rollback();
        return res.status(400).json({
          code: 400,
          message: `商品 ${item.productId} 不存在或已下架`
        });
      }

      if (product.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          code: 400,
          message: `商品 ${product.name} 库存不足`
        });
      }

      const subtotal = product.currentPrice * item.quantity;
      const commissionAmount = product.calculateCommission(subtotal);

      totalAmount += subtotal;
      totalCommission += commissionAmount;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        productImage: product.mainImage,
        quantity: item.quantity,
        unitPrice: product.currentPrice,
        subtotal,
        commissionAmount
      });

      // 扣减库存
      product.stock -= item.quantity;
      product.soldCount += item.quantity;
      await product.save({ transaction });
    }

    // 创建订单
    const order = await Order.create({
      orderNo: Order.generateOrderNo(),
      userId,
      totalAmount,
      actualAmount: totalAmount, // 实际支付金额（暂不考虑优惠）
      totalCommission,
      receiverName,
      receiverPhone,
      receiverAddress,
      paymentMethod,
      status: 'pending',
      commissionStatus: 'pending'
    }, { transaction });

    // 创建订单商品
    for (const itemData of orderItemsData) {
      await OrderItem.create({
        orderId: order.id,
        ...itemData
      }, { transaction });
    }

    // 如果有上级，创建待结算佣金记录
    if (user.referrerId && totalCommission > 0) {
      await distributeCommissions(order, user, orderItemsData, transaction);
    }

    await transaction.commit();

    res.status(201).json({
      code: 200,
      message: '订单创建成功',
      data: { order }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('创建订单失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建订单失败',
      error: error.message
    });
  }
};

// 分销佣金分配
async function distributeCommissions(order, buyer, orderItemsData, transaction) {
  const maxLevels = parseInt(process.env.MAX_COMMISSION_LEVELS) || 3;

  // 获取所有上级（最多 3 级）
  const referrals = await Referral.findAll({
    where: { refereeId: buyer.id, level: { [Op.lte]: maxLevels } },
    include: [{
      model: User,
      as: 'referrer',
      attributes: ['id', 'username', 'balance']
    }],
    order: [['level', 'ASC']],
    transaction
  });

  for (const referral of referrals) {
    const level = referral.level;
    const referrer = referral.referrer;

    // 获取该层级的佣金比例配置
    let levelRate = 10; // 默认 10%
    if (orderItemsData[0]?.productId) {
      const product = await Product.findByPk(orderItemsData[0].productId, { transaction });
      if (product?.commissionLevels) {
        const levelConfig = product.commissionLevels.find(l => l.level === level);
        if (levelConfig) {
          levelRate = levelConfig.rate;
        }
      }
    }

    // 计算该层级应得佣金
    const levelCommission = order.totalCommission * (levelRate / 100);

    // 创建佣金记录
    await Commission.create({
      commissionNo: Commission.generateCommissionNo(),
      userId: referrer.id,
      orderId: order.id,
      productId: orderItemsData[0].productId,
      amount: levelCommission,
      commissionRate: levelRate,
      level,
      status: 'pending',
      description: `第${level}级分销佣金 - 订单 ${order.orderNo}`
    }, { transaction });
  }
}

// 确认收款（更新订单状态）
exports.confirmPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;

    const order = await Order.findByPk(id, { transaction });
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        code: 404,
        message: '订单不存在'
      });
    }

    order.status = 'paid';
    order.paymentMethod = paymentMethod;
    order.paymentTime = new Date();
    order.commissionStatus = 'calculated';
    await order.save({ transaction });

    await transaction.commit();

    res.json({
      code: 200,
      message: '支付成功',
      data: { order }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('确认支付失败:', error);
    res.status(500).json({
      code: 500,
      message: '确认支付失败',
      error: error.message
    });
  }
};

// 完成订单（触发佣金发放）
// 确认收货（用户操作）
exports.confirmReceive = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, { transaction });
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        code: 404,
        message: '订单不存在'
      });
    }

    if (order.status !== 'shipped') {
      await transaction.rollback();
      return res.status(400).json({
        code: 400,
        message: '订单状态不是待收货，无法确认收货'
      });
    }

    // 更新订单状态为已收货
    order.status = 'completed';
    order.receivedAt = new Date();
    // 计算自动完成时间（收货后 15 天）
    const autoCompleteTime = new Date();
    autoCompleteTime.setDate(autoCompleteTime.getDate() + 15);
    order.completedAt = autoCompleteTime;
    await order.save({ transaction });

    // 获取订单关联的佣金记录，设置为冻结状态
    const commissions = await Commission.findAll({
      where: { orderId: id },
      transaction
    });

    for (const commission of commissions) {
      // 计算解冻时间（收货后 15 天）
      const unlockTime = new Date();
      unlockTime.setDate(unlockTime.getDate() + 15);

      await commission.update({
        status: 'frozen',  // 冻结状态
        frozenAt: new Date(),
        unlockAt: unlockTime
      }, { transaction });
    }

    await transaction.commit();

    res.json({
      code: 200,
      message: '确认收货成功，佣金已冻结，15 天后可提现'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('确认收货失败:', error);
    res.status(500).json({
      code: 500,
      message: '确认收货失败',
      error: error.message
    });
  }
};

// 定时任务：解冻到期佣金（每天执行）
exports.unlockCommissions = async () => {
  try {
    const now = new Date();
    
    // 查询所有已到解冻时间的冻结佣金
    const [updatedCount] = await Commission.update(
      { status: 'confirmed', confirmedAt: now },
      {
        where: {
          status: 'frozen',
          unlockAt: {
            [require('sequelize').Op.lte]: now
          }
        }
      }
    );

    if (updatedCount > 0) {
      console.log(`✅ 已解冻 ${updatedCount} 笔佣金`);
    }
    
    return updatedCount;
  } catch (error) {
    console.error('解冻佣金失败:', error);
    return 0;
  }
};

// 获取订单列表
exports.getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'mainImage']
        }]
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
    console.error('获取订单列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取订单列表失败',
      error: error.message
    });
  }
};
