const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// 检测环境
const isVercel = process.env.VERCEL === '1';
const hasDatabaseURL = process.env.DATABASE_URL;

let sequelize;

if (hasDatabaseURL) {
  // 使用 PostgreSQL（Supabase）
  console.log('📊 使用 PostgreSQL 数据库 (Supabase)');
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else if (isVercel) {
  // Vercel 环境使用 SQLite 内存模式（临时测试）
  console.log('⚠️ 使用 SQLite 内存模式（数据不会保存，仅用于测试）');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    define: {
      timestamps: true
    }
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
