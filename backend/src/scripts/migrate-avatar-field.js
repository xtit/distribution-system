/**
 * 数据库迁移脚本：修改 avatar_url 字段类型为 TEXT
 * 运行时间：2026-03-25
 */

const { sequelize } = require('../config/database');

async function migrate() {
  try {
    console.log('开始迁移：修改 avatar_url 字段类型...');
    
    // 修改 avatar_url 字段类型为 TEXT
    await sequelize.query(`
      ALTER TABLE users 
      MODIFY COLUMN avatar_url TEXT;
    `);
    
    console.log('✅ avatar_url 字段已修改为 TEXT 类型');
    
    // 验证修改
    const [results] = await sequelize.query(`
      DESCRIBE users;
    `);
    
    const avatarField = results.find(r => r.Field === 'avatar_url');
    console.log('字段信息:', avatarField);
    
    if (avatarField && avatarField.Type === 'text') {
      console.log('✅ 迁移成功！avatar_url 现在是 TEXT 类型');
    } else {
      console.warn('⚠️ 字段类型可能未正确修改，请手动检查');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    process.exit(1);
  }
}

migrate();
