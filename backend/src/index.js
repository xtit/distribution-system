const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection, syncDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');
const initDataRoutes = require('./routes/init-data');

const app = express();
const PORT = process.env.PORT || 3010;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件（二维码、上传文件等）
app.use('/qrcodes', express.static(path.join(__dirname, '../qrcodes')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/init', initDataRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在'
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动定时任务
require('./scheduler');

// 启动服务器
async function startServer() {
  try {
    // 测试数据库连接
    await testConnection();
    
    // 同步数据库模型（生产环境建议关闭 force）
    await syncDatabase(false);

    app.listen(PORT, () => {
      console.log(`✅ 服务器启动成功：http://localhost:${PORT}`);
      console.log(`📊 管理后台 API: http://localhost:${PORT}/api/admin`);
      console.log(`🛒 商品 API: http://localhost:${PORT}/api/products`);
      console.log(`🔐 认证 API: http://localhost:${PORT}/api/auth`);
      console.log(`⏰ 定时任务：每天 2:00 自动解冻佣金`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 启动服务器逻辑
async function bootstrap() {
  try {
    // Railway 和生产环境：先启动服务器，再异步初始化数据库
    if (process.env.NODE_ENV === 'production' || process.env.RAILWAY) {
      // 先启动服务器，让健康检查立即可用
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ 服务器启动成功：http://0.0.0.0:${PORT}`);
        console.log(`🌍 环境：${process.env.NODE_ENV || 'production'}`);
        console.log(`📊 管理后台 API: http://0.0.0.0:${PORT}/api/admin`);
        console.log(`🛒 商品 API: http://0.0.0.0:${PORT}/api/products`);
        console.log(`🔐 认证 API: http://0.0.0.0:${PORT}/api/auth`);
      });
      
      // 异步初始化数据库（不阻塞启动）
      setTimeout(async () => {
        try {
          console.log('🔄 正在初始化数据库连接...');
          await testConnection();
          await syncDatabase(false);
          console.log('✅ 数据库初始化完成');
        } catch (error) {
          console.error('❌ 数据库初始化失败:', error.message);
        }
      }, 1000);
    } else {
      // 本地开发：同步启动
      await testConnection();
      await syncDatabase(false);
      app.listen(PORT, () => {
        console.log(`✅ 服务器启动成功：http://localhost:${PORT}`);
      });
    }
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 启动应用
bootstrap();

// 自动执行头像字段迁移（仅执行一次）
async function runAvatarMigration() {
  try {
    // 等待 3 秒，确保数据库连接已建立
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const { sequelize } = require('./config/database');
    
    // 检查字段类型
    const [results] = await sequelize.query(`DESCRIBE users;`);
    const avatarField = results.find(r => r.Field === 'avatar_url');
    
    if (avatarField && !avatarField.Type.includes('text')) {
      console.log('🔄 检测到 avatar_url 字段不是 TEXT 类型，正在迁移...');
      await sequelize.query(`ALTER TABLE users MODIFY COLUMN avatar_url TEXT;`);
      console.log('✅ avatar_url 字段已迁移为 TEXT 类型');
    } else if (avatarField && avatarField.Type.includes('text')) {
      console.log('✅ avatar_url 字段已经是 TEXT 类型，跳过迁移');
    } else {
      console.warn('⚠️ 无法检测 avatar_url 字段，请手动检查');
    }
  } catch (error) {
    console.error('❌ 头像字段迁移失败:', error.message);
  }
}

// 生产环境自动执行迁移
if (process.env.NODE_ENV === 'production' || process.env.RAILWAY) {
  setTimeout(runAvatarMigration, 5000);
}

module.exports = app;
