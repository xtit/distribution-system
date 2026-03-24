// 修复数据库字段长度
const { sequelize } = require('./src/config/database');

async function fixSchema() {
  try {
    console.log('🔧 开始修复数据库字段...\n');
    
    // 将 users.qr_code_url 字段改为 TEXT 类型
    await sequelize.query(`
      ALTER TABLE users 
      ALTER COLUMN "qr_code_url" TYPE TEXT;
    `);
    
    console.log('✅ qrCodeUrl 字段已改为 TEXT 类型\n');
    
    // 验证
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'qr_code_url';
    `);
    
    console.log('当前字段信息：');
    results.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.character_maximum_length ? '(' + row.character_maximum_length + ')' : ''}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
    process.exit(1);
  }
}

fixSchema();
