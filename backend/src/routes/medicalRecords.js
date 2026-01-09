const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// 慢病档案相关路由 (需要认证)
router.get('/', authenticateToken, medicalRecordController.getAllMedicalRecords);
router.get('/:id', authenticateToken, medicalRecordController.getMedicalRecordById);
router.post('/', authenticateToken, requireRole(['admin', 'doctor']), medicalRecordController.createMedicalRecord);
router.put('/:id', authenticateToken, requireRole(['admin', 'doctor']), medicalRecordController.updateMedicalRecord);
router.delete('/:id', authenticateToken, requireRole(['admin']), medicalRecordController.deleteMedicalRecord);

module.exports = router;