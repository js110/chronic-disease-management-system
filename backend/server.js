const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// 初始化Express应用
const app = express();
const PORT = 3002;

// 中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
})); // 安全头部
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); // 跨域支持
app.use(morgan('combined')); // 请求日志
app.use(express.json()); // 解析JSON
app.use(express.urlencoded({ extended: true })); // 解析URL编码

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 导入路由
const apiRoutes = require('./src/routes');

// API路由
app.use('/api', apiRoutes);

// 测试路由
app.get('/', (req, res) => {
  res.json({ message: '慢性病管理系统后端API运行中...' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

module.exports = app;