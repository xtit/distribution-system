const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT 中间件 - 验证 token
const authMiddleware = async (req, res, next) => {
  try {
    // 从 header 获取 token
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证令牌'
      });
    }

    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['passwordHash'] }
    });

    if (!user || user.status !== 1) {
      return res.status(401).json({
        code: 401,
        message: '用户不存在或已被禁用'
      });
    }

    // 将用户信息附加到请求对象
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        code: 401,
        message: '无效的认证令牌'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 401,
        message: '认证令牌已过期'
      });
    }
    next(error);
  }
};

// 管理员中间件
const adminMiddleware = async (req, res, next) => {
  if (!req.user || req.user.isAdmin !== 1) {
    return res.status(403).json({
      code: 403,
      message: '需要管理员权限'
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware
};
