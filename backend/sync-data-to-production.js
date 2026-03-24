/**
 * 数据同步脚本 - 本地 SQLite → 线上 Supabase (PostgreSQL)
 * 
 * 使用方法:
 * node sync-data-to-production.js
 */

const sqlite3 = require('sqlite3').verbose();
const { Sequelize } = require('sequelize');
const path = require('path');

// 本地 SQLite 数据库路径
const LOCAL_DB_PATH = path.join(__dirname, 'data/distribution.db');

// 线上 Supabase 数据库连接
const PROD_DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://postgres.kdpgnhpfkyugrlnpmtju:JgdDwJ9iK2Df8hdu@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';

console.log('🚀 开始数据同步...\n');
console.log('📤 源数据库：', LOCAL_DB_PATH);
console.log('📥 目标数据库：', PROD_DATABASE_URL.replace(/\/\/(.+):(.+)@/, '://***:***@'));
console.log('');

// 创建本地 SQLite 连接
const localDb = new sqlite3.Database(LOCAL_DB_PATH, sqlite3.OPEN_READONLY);

// 创建线上 PostgreSQL 连接
const prodDb = new Sequelize(PROD_DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false,
  pool: {
    max: 1,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// 需要同步的表
const TABLES = [
  'Users',
  'Products',
  'Orders',
  'OrderItems',
  'Commissions',
  'Referrals',
  'Configs'
];

// 主键字段映射
const PRIMARY_KEYS = {
  Users: 'id',
  Products: 'id',
  Orders: 'id',
  OrderItems: 'id',
  Commissions: 'id',
  Referrals: 'id',
  Configs: 'id'
};

async function syncTable(tableName) {
  return new Promise((resolve, reject) => {
    console.log(`📊 同步表：${tableName}...`);
    
    localDb.all(`SELECT * FROM ${tableName}`, [], async (err, rows) => {
      if (err) {
        console.log(`  ❌ 读取失败：${err.message}`);
        return resolve({ table: tableName, success: false, count: 0 });
      }
      
      if (rows.length === 0) {
        console.log(`  ⏭️  空表，跳过`);
        return resolve({ table: tableName, success: true, count: 0 });
      }
      
      console.log(`  📦 本地数据：${rows.length} 条`);
      
      // 获取表结构
      const columns = Object.keys(rows[0]);
      const pk = PRIMARY_KEYS[tableName] || 'id';
      
      // 过滤掉自增主键（PostgreSQL 会自己处理）
      const insertColumns = columns.filter(col => col !== pk);
      
      let successCount = 0;
      let skipCount = 0;
      let errorCount = 0;
      
      for (const row of rows) {
        try {
          // 检查记录是否已存在（通过业务字段判断）
          const whereClause = {};
          
          // 使用除主键外的关键字段作为唯一性判断
          if (tableName === 'Users') {
            whereClause.username = row.username;
          } else if (tableName === 'Products') {
            whereClause.name = row.name;
          } else if (tableName === 'Orders') {
            whereClause.orderNo = row.orderNo;
          } else {
            // 其他表尝试用主键判断
            whereClause[pk] = row[pk];
          }
          
          // 检查是否已存在
          const existing = await prodDb.query(
            `SELECT 1 FROM "${tableName}" WHERE ${Object.keys(whereClause).map(k => `"${k}" = :${k}`).join(' AND ')}`,
            {
              replacements: whereClause,
              type: Sequelize.QueryTypes.SELECT
            }
          );
          
          if (existing.length > 0) {
            console.log(`  ⏭️  跳过已存在：${tableName}.${pk}=${row[pk]}`);
            skipCount++;
            continue;
          }
          
          // 插入数据
          const insertData = {};
          insertColumns.forEach(col => {
            insertData[col] = row[col];
          });
          
          // 处理 null 和 undefined
          Object.keys(insertData).forEach(key => {
            if (insertData[key] === undefined) {
              insertData[key] = null;
            }
          });
          
          await prodDb.getQueryInterface().insert(null, tableName, insertData);
          successCount++;
          
        } catch (error) {
          console.log(`  ❌ 插入失败 ${tableName}.${pk}=${row[pk]}: ${error.message}`);
          errorCount++;
        }
      }
      
      console.log(`  ✅ 成功：${successCount} 条，跳过：${skipCount} 条，失败：${errorCount} 条\n`);
      resolve({ table: tableName, success: true, count: successCount });
    });
  });
}

async function main() {
  try {
    // 测试本地数据库连接
    console.log('1️⃣ 测试本地数据库连接...');
    await new Promise((resolve, reject) => {
      localDb.get("SELECT name FROM sqlite_master WHERE type='table' LIMIT 1", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('   ✅ 本地数据库连接成功\n');
    
    // 测试线上数据库连接
    console.log('2️⃣ 测试线上数据库连接...');
    await prodDb.authenticate();
    console.log('   ✅ 线上数据库连接成功\n');
    
    // 同步每个表
    console.log('3️⃣ 开始同步数据...\n');
    const results = [];
    
    for (const table of TABLES) {
      const result = await syncTable(table);
      results.push(result);
    }
    
    // 汇总结果
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 同步完成汇总：');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const totalSuccess = results.filter(r => r.success).length;
    const totalRecords = results.reduce((sum, r) => sum + (r.count || 0), 0);
    
    results.forEach(r => {
      const status = r.success ? '✅' : '❌';
      console.log(`${status} ${r.table}: ${r.count || 0} 条`);
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🎉 总计：${totalSuccess}/${TABLES.length} 个表，${totalRecords} 条记录`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('\n❌ 同步失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    // 关闭连接
    localDb.close();
    await prodDb.close();
    console.log('👋 数据库连接已关闭\n');
  }
}

// 运行同步
main();
