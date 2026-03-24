// 修复 commissions 表结构
const { sequelize } = require('./src/config/database');

async function fixTable() {
  try {
    console.log('🔧 开始修复 commissions 表结构...\n');
    
    // 添加缺失的字段
    const queries = [
      // commission_no - 佣金编号
      `ALTER TABLE commissions ADD COLUMN IF NOT EXISTS commission_no VARCHAR(50)`,
      
      // commission_rate - 佣金比例
      `ALTER TABLE commissions ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2)`,
      
      // level - 分销层级
      `ALTER TABLE commissions ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1`,
      
      // description - 描述
      `ALTER TABLE commissions ADD COLUMN IF NOT EXISTS description VARCHAR(500)`,
      
      // confirmed_at - 确认可提现时间
      `ALTER TABLE commissions ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE`
    ];
    
    for (const query of queries) {
      try {
        await sequelize.query(query);
        console.log(`✅ 执行成功：${query.substring(0, 80)}...`);
      } catch (error) {
        console.log(`⚠️  跳过或失败：${error.message.substring(0, 80)}...`);
      }
    }
    
    // 为 commission_no 添加唯一约束（如果不存在）
    try {
      await sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'commissions_commission_no_key'
          ) THEN
            ALTER TABLE commissions ADD CONSTRAINT commissions_commission_no_key UNIQUE (commission_no);
          END IF;
        END $$;
      `);
      console.log('✅ 添加唯一约束成功');
    } catch (error) {
      console.log(`⚠️  唯一约束可能已存在：${error.message}`);
    }
    
    console.log('\n🎉 commissions 表结构修复完成！\n');
    
    // 验证修复结果
    const [results] = await sequelize.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'commissions'
      ORDER BY ordinal_position;
    `);
    
    console.log('当前 commissions 表结构：');
    results.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 修复失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixTable();
