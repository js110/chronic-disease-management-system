const jwt = require('jsonwebtoken');
const db = require('../config/db');

// 简化认证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '访问令牌缺失' });
  }

  // 简化版本：只要有token就认为是有效的
  if (token.startsWith('admin-token-') || token.startsWith('token-') || token.startsWith('test-token-')) {
    // 模拟用户信息
    req.user = {
      id: 1,
      username: 'admin',
      role: 'admin',
      associated_id: null
    };
    next();
  } else {
    return res.status(403).json({ error: '令牌无效' });
  }
};

// 角色权限检查中间件
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: '未认证用户' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: '权限不足' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole
};