const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticateToken } = require('../middleware/auth');

// 上传头像
router.post('/avatar', authenticateToken, uploadController.uploadAvatar, uploadController.handleAvatarUpload);

// 删除头像
router.delete('/avatar/:filename', authenticateToken, uploadController.deleteAvatar);

module.exports = router;