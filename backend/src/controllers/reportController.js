const db = require('../config/db');

// 获取系统统计概览
exports.getSystemStats = (req, res) => {
  const stats = {};
  
  // 并行执行多个查询
  const queries = [
    // 总患者数
    new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM patients', [], (err, row) => {
        if (err) reject(err);
        else resolve({ totalPatients: row.count });
      });
    }),
    
    // 活跃病历数
    new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM medical_records WHERE status = 'active'", [], (err, row) => {
        if (err) reject(err);
        else resolve({ activeRecords: row.count });
      });
    }),
    
    // 今日健康指标记录数
    new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM health_indicators WHERE DATE(recorded_date) = DATE('now')", [], (err, row) => {
        if (err) reject(err);
        else resolve({ todayIndicators: row.count });
      });
    }),
    
    // 用药记录数
    new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM medications', [], (err, row) => {
        if (err) reject(err);
        else resolve({ totalMedications: row.count });
      });
    })
  ];
  
  Promise.all(queries)
    .then(results => {
      results.forEach(result => Object.assign(stats, result));
      res.json({ stats });
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
};

// 获取疾病分布统计
exports.getDiseaseDistribution = (req, res) => {
  const sql = `SELECT cdt.disease_name, COUNT(*) as count 
               FROM medical_records mr 
               JOIN chronic_disease_types cdt ON mr.disease_type_id = cdt.id 
               GROUP BY cdt.disease_name 
               ORDER BY count DESC`;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ distribution: rows });
  });
};

// 获取健康指标趋势
exports.getHealthIndicatorTrends = (req, res) => {
  const { patientId, indicatorType, days = 30 } = req.query;
  
  let sql = `SELECT indicator_type, value, recorded_date, unit 
             FROM health_indicators hi 
             JOIN medical_records mr ON hi.record_id = mr.id 
             WHERE DATE(recorded_date) >= DATE('now', '-${days} days')`;
  let params = [];
  
  if (patientId) {
    sql += ' AND mr.patient_id = ?';
    params.push(patientId);
  }
  
  if (indicatorType) {
    sql += ' AND indicator_type = ?';
    params.push(indicatorType);
  }
  
  sql += ' ORDER BY recorded_date ASC';
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ trends: rows });
  });
};

// 获取患者年龄分布
exports.getPatientAgeDistribution = (req, res) => {
  const sql = `SELECT 
                 CASE 
                   WHEN (julianday('now') - julianday(birth_date))/365.25 < 30 THEN '30岁以下'
                   WHEN (julianday('now') - julianday(birth_date))/365.25 < 50 THEN '30-50岁'
                   WHEN (julianday('now') - julianday(birth_date))/365.25 < 70 THEN '50-70岁'
                   ELSE '70岁以上'
                 END as age_group,
                 COUNT(*) as count
               FROM patients 
               WHERE birth_date IS NOT NULL
               GROUP BY age_group`;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ ageDistribution: rows });
  });
};

// 获取用药统计
exports.getMedicationStats = (req, res) => {
  const sql = `SELECT medication_name, COUNT(*) as usage_count 
               FROM medications 
               GROUP BY medication_name 
               ORDER BY usage_count DESC 
               LIMIT 10`;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ medicationStats: rows });
  });
};

// 获取患者风险等级分布
exports.getRiskDistribution = (req, res) => {
  // 基于患者的慢性病数量和最新健康指标来评估风险等级
  const sql = `
    WITH patient_risk AS (
      SELECT 
        p.id,
        p.name,
        COUNT(DISTINCT mr.id) as disease_count,
        -- 获取最新血压值
        (SELECT hi.value FROM health_indicators hi 
         JOIN medical_records mr2 ON hi.record_id = mr2.id 
         WHERE mr2.patient_id = p.id AND hi.indicator_type = 'blood_pressure' 
         ORDER BY hi.recorded_date DESC LIMIT 1) as latest_bp,
        -- 获取最新血糖值
        (SELECT hi.value FROM health_indicators hi 
         JOIN medical_records mr2 ON hi.record_id = mr2.id 
         WHERE mr2.patient_id = p.id AND hi.indicator_type = 'blood_glucose' 
         ORDER BY hi.recorded_date DESC LIMIT 1) as latest_glucose,
        -- 计算年龄
        CAST((julianday('now') - julianday(p.birth_date))/365.25 AS INTEGER) as age
      FROM patients p
      LEFT JOIN medical_records mr ON p.id = mr.patient_id
      WHERE p.patient_id LIKE 'P%'  -- 只统计演示患者
      GROUP BY p.id, p.name, p.birth_date
    ),
    risk_assessment AS (
      SELECT 
        *,
        CASE 
          WHEN disease_count >= 3 OR 
               (latest_bp IS NOT NULL AND latest_bp > 140) OR 
               (latest_glucose IS NOT NULL AND latest_glucose > 126) OR 
               age > 70 
          THEN '高风险'
          WHEN disease_count >= 2 OR 
               (latest_bp IS NOT NULL AND latest_bp > 120) OR 
               (latest_glucose IS NOT NULL AND latest_glucose > 100) OR 
               age > 60 
          THEN '中风险'
          ELSE '低风险'
        END as risk_level
      FROM patient_risk
    )
    SELECT risk_level, COUNT(*) as count
    FROM risk_assessment
    GROUP BY risk_level
    ORDER BY 
      CASE risk_level 
        WHEN '高风险' THEN 1 
        WHEN '中风险' THEN 2 
        WHEN '低风险' THEN 3 
      END
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('风险分布查询失败:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ riskDistribution: rows });
  });
};