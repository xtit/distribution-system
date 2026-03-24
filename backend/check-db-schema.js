// 检查数据库表结构
const { sequelize } = require('./src/config/database');

async function checkSchema() {
  try {
    console.log('检查 commissions 表结构...\n');
    
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'commissions'
      ORDER BY ordinal_position;
    `);
    
    console.log('commissions 表列：');
    results.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('错误:', error.message);
    process.exit(1);
  }
}

checkSchema();
