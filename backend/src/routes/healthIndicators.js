const express = require('express');
const router = express.Router();
const healthIndicatorController = require('../controllers/healthIndicatorController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// 健康指标相关路由 (需要认证)
router.get('/', authenticateToken, healthIndicatorController.getAllHealthIndicators);
router.get('/:id', authenticateToken, healthIndicatorController.getHealthIndicatorById);
router.post('/', authenticateToken, requireRole(['admin', 'doctor']), healthIndicatorController.createHealthIndicator);
router.put('/:id', authenticateToken, requireRole(['admin', 'doctor']), healthIndicatorController.updateHealthIndicator);
router.delete('/:id', authenticateToken, requireRole(['admin']), healthIndicatorController.deleteHealthIndicator);

// 按患者查询健康指标
router.get('/patient/:patientId', authenticateToken, healthIndicatorController.getHealthIndicatorsByPatient);
router.get('/patient/:patientId/stats', authenticateToken, healthIndicatorController.getHealthIndicatorStats);

module.exports = router;