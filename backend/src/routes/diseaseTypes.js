const express = require('express');
const router = express.Router();
const diseaseTypeController = require('../controllers/diseaseTypeController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// 获取所有慢性病类型
router.get('/', authenticateToken, diseaseTypeController.getAllDiseaseTypes);

// 根据ID获取慢性病类型
router.get('/:id', authenticateToken, diseaseTypeController.getDiseaseTypeById);

// 创建新慢性病类型 (仅管理员)
router.post('/', authenticateToken, requireRole(['admin']), diseaseTypeController.createDiseaseType);

// 更新慢性病类型 (仅管理员)
router.put('/:id', authenticateToken, requireRole(['admin']), diseaseTypeController.updateDiseaseType);

// 删除慢性病类型 (仅管理员)
router.delete('/:id', authenticateToken, requireRole(['admin']), diseaseTypeController.deleteDiseaseType);

module.exports = router;