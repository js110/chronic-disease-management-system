const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// 患者相关路由 (需要认证)
router.get('/', authenticateToken, patientController.getAllPatients);
router.get('/:id', authenticateToken, patientController.getPatientById);
router.post('/', authenticateToken, requireRole(['admin', 'doctor']), patientController.createPatient);
router.put('/:id', authenticateToken, requireRole(['admin', 'doctor']), patientController.updatePatient);
router.delete('/:id', authenticateToken, requireRole(['admin']), patientController.deletePatient);

module.exports = router;