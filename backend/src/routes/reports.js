const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

// 统计报表相关路由 (需要认证)
router.get('/stats', authenticateToken, reportController.getSystemStats);
router.get('/disease-distribution', authenticateToken, reportController.getDiseaseDistribution);
router.get('/health-trends', authenticateToken, reportController.getHealthIndicatorTrends);
router.get('/age-distribution', authenticateToken, reportController.getPatientAgeDistribution);
router.get('/medication-stats', authenticateToken, reportController.getMedicationStats);
router.get('/risk-distribution', authenticateToken, reportController.getRiskDistribution);

module.exports = router;