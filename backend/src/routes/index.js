const express = require('express');
const router = express.Router();

// 导入各个路由模块
const authRouter = require('./auth');
const patientsRouter = require('./patients');
const doctorsRouter = require('./doctors');
const diseaseTypesRouter = require('./diseaseTypes');
const medicalRecordsRouter = require('./medicalRecords');
const healthIndicatorsRouter = require('./healthIndicators');
const medicationsRouter = require('./medications');
const reportsRouter = require('./reports');
const uploadRouter = require('./upload');

// 定义路由前缀
router.use('/auth', authRouter);
router.use('/patients', patientsRouter);
router.use('/doctors', doctorsRouter);
router.use('/disease-types', diseaseTypesRouter);
router.use('/medical-records', medicalRecordsRouter);
router.use('/health-indicators', healthIndicatorsRouter);
router.use('/medications', medicationsRouter);
router.use('/reports', reportsRouter);
router.use('/upload', uploadRouter);

// 根路由
router.get('/', (req, res) => {
  res.json({
    message: '慢性病管理系统API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      patients: '/api/patients',
      doctors: '/api/doctors',
      diseaseTypes: '/api/disease-types',
      medicalRecords: '/api/medical-records',
      healthIndicators: '/api/health-indicators',
      medications: '/api/medications',
      reports: '/api/reports',
      upload: '/api/upload'
    }
  });
});

module.exports = router;