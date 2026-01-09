const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// 验证中间件
const validateRegistration = [
  body('username').isLength({ min: 3 }).withMessage('用户名至少3个字符'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6个字符'),
  body('role').isIn(['admin', 'doctor', 'patient']).withMessage('角色必须是admin、doctor或patient')
];

const validateLogin = [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
];

// 处理验证错误
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// 用户注册
router.post('/register', validateRegistration, handleValidationErrors, authController.register);

// 用户登录
router.post('/login', validateLogin, handleValidationErrors, authController.login);

// 获取当前用户信息
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;