const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medicationController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// 用药记录相关路由 (需要认证)
router.get('/', authenticateToken, medicationController.getAllMedications);
router.get('/:id', authenticateToken, medicationController.getMedicationById);
router.post('/', authenticateToken, requireRole(['admin', 'doctor']), medicationController.createMedication);
router.put('/:id', authenticateToken, requireRole(['admin', 'doctor']), medicationController.updateMedication);
router.delete('/:id', authenticateToken, requireRole(['admin']), medicationController.deleteMedication);

// 按患者查询用药记录
router.get('/patient/:patientId', authenticateToken, medicationController.getMedicationsByPatient);

module.exports = router;