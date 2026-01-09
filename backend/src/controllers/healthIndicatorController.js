// 健康指标控制器
const db = require('../config/db');

// 获取所有健康指标
exports.getAllHealthIndicators = (req, res) => {
  const { patient_id, limit } = req.query;
  
  let sql = `SELECT hi.*, mr.id as record_id, p.name as patient_name 
             FROM health_indicators hi 
             JOIN medical_records mr ON hi.record_id = mr.id 
             JOIN patients p ON mr.patient_id = p.id`;
  
  let params = [];
  
  if (patient_id) {
    sql += ' WHERE mr.patient_id = ?';
    params.push(patient_id);
  }
  
  sql += ' ORDER BY hi.recorded_date DESC';
  
  if (limit) {
    sql += ' LIMIT ?';
    params.push(parseInt(limit));
  }
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ indicators: rows });
  });
};

// 根据ID获取健康指标
exports.getHealthIndicatorById = (req, res) => {
  const { id } = req.params;
  const sql = `SELECT hi.*, mr.id as record_id, p.name as patient_name 
               FROM health_indicators hi 
               JOIN medical_records mr ON hi.record_id = mr.id 
               JOIN patients p ON mr.patient_id = p.id 
               WHERE hi.id = ?`;
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Health indicator not found' });
    }
    res.json({ healthIndicator: row });
  });
};

// 创建新健康指标
exports.createHealthIndicator = (req, res) => {
  const { record_id, indicator_type, value, unit, recorded_date, notes } = req.body;
  const sql = `INSERT INTO health_indicators (record_id, indicator_type, value, unit, recorded_date, notes) 
               VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [record_id, indicator_type, value, unit, recorded_date, notes], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, message: 'Health indicator created successfully' });
  });
};

// 更新健康指标
exports.updateHealthIndicator = (req, res) => {
  const { id } = req.params;
  const { record_id, indicator_type, value, unit, recorded_date, notes } = req.body;
  const sql = `UPDATE health_indicators SET 
               record_id = ?, indicator_type = ?, value = ?, unit = ?, 
               recorded_date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP 
               WHERE id = ?`;
  
  db.run(sql, [record_id, indicator_type, value, unit, recorded_date, notes, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Health indicator not found' });
    }
    res.json({ message: 'Health indicator updated successfully' });
  });
};

// 删除健康指标
exports.deleteHealthIndicator = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM health_indicators WHERE id = ?';
  
  db.run(sql, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Health indicator not found' });
    }
    res.json({ message: 'Health indicator deleted successfully' });
  });
};

// 根据患者ID获取健康指标
exports.getHealthIndicatorsByPatient = (req, res) => {
  const { patientId } = req.params;
  const { indicatorType, startDate, endDate } = req.query;
  
  let sql = `SELECT hi.*, mr.id as record_id 
             FROM health_indicators hi 
             JOIN medical_records mr ON hi.record_id = mr.id 
             WHERE mr.patient_id = ?`;
  let params = [patientId];
  
  if (indicatorType) {
    sql += ' AND hi.indicator_type = ?';
    params.push(indicatorType);
  }
  
  if (startDate) {
    sql += ' AND hi.recorded_date >= ?';
    params.push(startDate);
  }
  
  if (endDate) {
    sql += ' AND hi.recorded_date <= ?';
    params.push(endDate);
  }
  
  sql += ' ORDER BY hi.recorded_date DESC';
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ healthIndicators: rows });
  });
};

// 获取健康指标统计
exports.getHealthIndicatorStats = (req, res) => {
  const { patientId } = req.params;
  const { indicatorType } = req.query;
  
  let sql = `SELECT 
             indicator_type,
             COUNT(*) as count,
             AVG(value) as average,
             MIN(value) as minimum,
             MAX(value) as maximum,
             MIN(recorded_date) as first_record,
             MAX(recorded_date) as last_record
             FROM health_indicators hi 
             JOIN medical_records mr ON hi.record_id = mr.id 
             WHERE mr.patient_id = ?`;
  let params = [patientId];
  
  if (indicatorType) {
    sql += ' AND hi.indicator_type = ?';
    params.push(indicatorType);
  }
  
  sql += ' GROUP BY indicator_type';
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ stats: rows });
  });
};