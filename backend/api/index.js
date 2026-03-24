// Vercel Serverless Entry Point for Express
const app = require('../src/index');

// Vercel Serverless handler
module.exports = async (req, res) => {
  // 处理 CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }
  
  // 使用 Express 处理请求
  return new Promise((resolve, reject) => {
    app(req, res, (err) => {
      if (err) {
        console.error('Serverless error:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
