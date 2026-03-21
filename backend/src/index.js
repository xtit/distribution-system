const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection, syncDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');

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

// Vercel Serverless 环境不自动启动服务器
if (process.env.VERCEL !== '1') {
  startServer();
}

module.exports = app;
