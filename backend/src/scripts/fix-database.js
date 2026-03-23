const { sequelize } = require('../config/database');

async function fixDatabase() {
  try {
    console.log('🔧 开始修复数据库表结构...');
    
    // 为 products 表添加 deleted_at 字段
    await sequelize.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
    `);
    console.log('✅ products 表添加 deleted_at 字段成功');
    
    // 为 users 表添加 deleted_at 字段
    await sequelize.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
    `);
    console.log('✅ users 表添加 deleted_at 字段成功');
    
    // 为 orders 表添加 deleted_at 字段
    await sequelize.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
    `);
    console.log('✅ orders 表添加 deleted_at 字段成功');
    
    console.log('✅ 数据库修复完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库修复失败:', error.message);
    process.exit(1);
  }
}

fixDatabase();
