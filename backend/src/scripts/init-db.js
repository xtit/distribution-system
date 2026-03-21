const { sequelize, testConnection, syncDatabase } = require('../config/database');
const { User, Product, Referral, Commission } = require('../models');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  console.log('🚀 开始初始化数据库...');
  
  // 测试连接
  await testConnection();
  
  // 同步数据库结构
  await syncDatabase(true); // force: true 会删除旧表重建
  console.log('✅ 数据库表结构创建完成');
  
  // 创建默认管理员账户
  const adminExists = await User.findOne({ where: { username: 'admin' } });
  if (!adminExists) {
    await User.create({
      username: 'admin',
      passwordHash: 'admin123', // beforeCreate 钩子会自动哈希
      nickname: '系统管理员',
      phone: '13800000000',
      email: 'admin@example.com',
      referralCode: 'ADMIN001',
      isAdmin: 1,
      status: 1
    });
    console.log('✅ 管理员账户创建成功 (用户名：admin, 密码：admin123)');
  }
  
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
      commissionValue: 15, // 15% 佣金
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
      commissionValue: 10, // 10% 佣金
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
      commissionValue: 50, // 固定 50 元佣金
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
  
  for (const productData of products) {
    const existing = await Product.findOne({ where: { name: productData.name } });
    if (!existing) {
      await Product.create(productData);
      console.log(`✅ 商品创建成功：${productData.name}`);
    }
  }
  
  console.log('\n🎉 数据库初始化完成！');
  console.log('\n📋 测试账户信息:');
  console.log('   管理员：admin / admin123');
  console.log('\n📦 已创建 5 个测试商品');
  console.log('\n🚀 现在可以运行：npm run dev 启动服务器');
  
  process.exit(0);
}

initDatabase().catch(err => {
  console.error('❌ 初始化失败:', err);
  process.exit(1);
});
