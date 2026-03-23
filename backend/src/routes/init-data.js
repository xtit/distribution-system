const express = require('express');
const router = express.Router();
const { Product, User } = require('../models');
const { authenticate, requireAdmin } = require('../middleware/auth');

// 初始化测试数据（仅管理员可用）
router.post('/init-test-data', authenticate, requireAdmin, async (req, res) => {
  try {
    console.log('🚀 开始初始化测试数据...');
    
    // 创建测试商品
    const products = [
      {
        name: '精品茶叶礼盒',
        description: '高山乌龙茶，清香甘甜，送礼佳品',
        originalPrice: 299.00,
        currentPrice: 199.00,
        costPrice: 80.00,
        stock: 100,
        commissionType: 'percentage',
        commissionValue: 15,
        isHot: 1,
        status: 1
      },
      {
        name: '智能手表',
        description: '多功能智能手表，健康监测，运动追踪',
        originalPrice: 999.00,
        currentPrice: 699.00,
        costPrice: 300.00,
        stock: 50,
        commissionType: 'percentage',
        commissionValue: 10,
        isHot: 1,
        status: 1
      },
      {
        name: '无线蓝牙耳机',
        description: '降噪蓝牙耳机，长续航，音质出色',
        originalPrice: 599.00,
        currentPrice: 399.00,
        costPrice: 150.00,
        stock: 200,
        commissionType: 'fixed',
        commissionValue: 50,
        isHot: 0,
        status: 1
      },
      {
        name: '便携充电宝',
        description: '20000mAh 大容量，快充协议，轻薄便携',
        originalPrice: 199.00,
        currentPrice: 129.00,
        costPrice: 50.00,
        stock: 300,
        commissionType: 'percentage',
        commissionValue: 12,
        isHot: 0,
        status: 1
      },
      {
        name: '护肤套装',
        description: '补水保湿护肤套装，温和配方，适合敏感肌',
        originalPrice: 499.00,
        currentPrice: 359.00,
        costPrice: 120.00,
        stock: 80,
        commissionType: 'percentage',
        commissionValue: 20,
        isHot: 1,
        status: 1
      }
    ];
    
    let created = 0;
    let skipped = 0;
    
    for (const productData of products) {
      const existing = await Product.findOne({ where: { name: productData.name } });
      if (!existing) {
        await Product.create(productData);
        created++;
        console.log(`✅ 商品创建成功：${productData.name}`);
      } else {
        skipped++;
        console.log(`⏭️  商品已存在，跳过：${productData.name}`);
      }
    }
    
    res.json({
      code: 200,
      message: '测试数据初始化完成',
      data: {
        created,
        skipped,
        total: products.length
      }
    });
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    res.status(500).json({
      code: 500,
      message: '初始化测试数据失败',
      error: error.message
    });
  }
});

module.exports = router;
