const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// 检测环境
const isVercel = process.env.VERCEL === '1';
const isRailway = process.env.RAILWAY === 'true' || process.env.RAILWAY_ENVIRONMENT === 'production';
const hasDatabaseURL = process.env.DATABASE_URL;

let sequelize;

// Vercel 或有 DATABASE_URL 或 Railway 时使用 PostgreSQL
if (isVercel || hasDatabaseURL || isRailway) {
  // 使用 PostgreSQL（Supabase）
  console.log('📊 使用 PostgreSQL 数据库 (Supabase)');
  
  // 使用环境变量中的 DATABASE_URL
  const dbUrl = process.env.DATABASE_URL || 
                'postgresql://postgres.kdpgnhpfkyugrlnpmtju:JgdDwJ9iK2Df8hdu@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';
  
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ 已设置' : '⚠️ 使用默认值');
  console.log('Environment:', { isVercel, isRailway, hasDatabaseURL });
  
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
      // 增加超时时间
      requestTimeout: 30000,
      connectTimeout: 30000
    },
    logging: false, // 生产环境禁用日志
    define: {
      timestamps: true
    },
    pool: {
      max: 2, // Serverless 环境减少连接池大小
      min: 0,
      acquire: 60000,
      idle: 10000,
      create: 60000,
      destroy: 10000
    },
    // 连接超时配置
    connectionTimeout: 30000,
    idleTimeout: 10000
  });
} else {
  // 本地开发使用 SQLite 文件
  console.log('💾 使用 SQLite 文件数据库');
  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/distribution.db');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true
    }
  });
}

// 测试连接
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    throw error;
  }
}

// 同步数据库
async function syncDatabase(force = false) {
  try {
    await sequelize.sync({ force });
    console.log('✅ 数据库同步完成');
  } catch (error) {
    console.error('❌ 数据库同步失败:', error.message);
    throw error;
  }
}

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
};
