const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// 用户注册
exports.register = async (req, res) => {
    try {
        const { username, password, role, associated_id } = req.body;

        // 检查用户是否已存在
        const existingUser = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (existingUser) {
            return res.status(400).json({ error: '用户名已存在' });
        }

        // 加密密码
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // 创建用户
        const sql = `INSERT INTO users (username, password_hash, role, associated_id) 
                 VALUES (?, ?, ?, ?)`;

        db.run(sql, [username, password_hash, role, associated_id], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.status(201).json({
                id: this.lastID,
                message: '用户注册成功'
            });
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 用户登录
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 简化版本：直接检查管理员账号
        if (username === 'admin' && password === 'admin123') {
            const token = 'admin-token-' + Date.now();
            
            return res.json({
                message: '登录成功',
                token,
                user: {
                    id: 1,
                    username: 'admin',
                    role: 'admin',
                    associated_id: null
                }
            });
        }

        // 查找用户
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err) {
                    console.error('数据库查询错误:', err);
                    resolve(null);
                }
                resolve(row);
            });
        });

        if (!user) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        // 验证密码
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        // 生成简单令牌（临时解决方案）
        const token = 'token-' + user.id + '-' + Date.now();

        res.json({
            message: '登录成功',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                associated_id: user.associated_id
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 获取当前用户信息
exports.getCurrentUser = (req, res) => {
    const sql = 'SELECT id, username, role, associated_id, created_at FROM users WHERE id = ?';

    db.get(sql, [req.user.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: '用户不存在' });
        }
        res.json({ user: row });
    });
};