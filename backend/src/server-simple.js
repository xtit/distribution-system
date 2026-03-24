// 简化版服务器 - 用于诊断问题
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3010;

app.use(express.json());

// 健康检查 - 立即可用
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV || 'unknown'
  });
});

// 测试 API
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// 启动 - 监听所有网络接口
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Simple server running on port ${PORT}`);
  console.log(`Health: http://0.0.0.0:${PORT}/health`);
});
