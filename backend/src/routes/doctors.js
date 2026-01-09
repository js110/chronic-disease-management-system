const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// 获取所有医生
router.get('/', authenticateToken, doctorController.getAllDoctors);

// 根据ID获取医生
router.get('/:id', authenticateToken, doctorController.getDoctorById);

// 创建新医生 (仅管理员)
router.post('/', authenticateToken, requireRole(['admin']), doctorController.createDoctor);

// 更新医生信息 (管理员或医生本人)
router.put('/:id', authenticateToken, doctorController.updateDoctor);

// 删除医生 (仅管理员)
router.delete('/:id', authenticateToken, requireRole(['admin']), doctorController.deleteDoctor);

module.exports = router;