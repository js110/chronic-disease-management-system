// 慢病档案控制器
const db = require('../config/db');

// 获取所有慢病档案
exports.getAllMedicalRecords = (req, res) => {
  const { patient_id } = req.query;
  
  let sql = `SELECT mr.*, p.name as patient_name, cdt.disease_name 
             FROM medical_records mr 
             JOIN patients p ON mr.patient_id = p.id 
             JOIN chronic_disease_types cdt ON mr.disease_type_id = cdt.id`;
  
  let params = [];
  
  if (patient_id) {
    sql += ' WHERE mr.patient_id = ?';
    params.push(patient_id);
  }
  
  sql += ' ORDER BY mr.created_at DESC';
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ records: rows });
  });
};

// 根据ID获取慢病档案
exports.getMedicalRecordById = (req, res) => {
  const { id } = req.params;
  const sql = `SELECT mr.*, p.name as patient_name, cdt.disease_name 
               FROM medical_records mr 
               JOIN patients p ON mr.patient_id = p.id 
               JOIN chronic_disease_types cdt ON mr.disease_type_id = cdt.id 
               WHERE mr.id = ?`;
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Medical record not found' });
    }
    res.json({ medicalRecord: row });
  });
};

// 创建新慢病档案
exports.createMedicalRecord = (req, res) => {
  const { patient_id, disease_type_id, diagnosis_date, status, notes } = req.body;
  const sql = `INSERT INTO medical_records (patient_id, disease_type_id, diagnosis_date, status, notes) 
               VALUES (?, ?, ?, ?, ?)`;
  
  db.run(sql, [patient_id, disease_type_id, diagnosis_date, status, notes], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, message: 'Medical record created successfully' });
  });
};

// 更新慢病档案
exports.updateMedicalRecord = (req, res) => {
  const { id } = req.params;
  const { patient_id, disease_type_id, diagnosis_date, status, notes } = req.body;
  const sql = `UPDATE medical_records SET 
               patient_id = ?, disease_type_id = ?, diagnosis_date = ?, 
               status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP 
               WHERE id = ?`;
  
  db.run(sql, [patient_id, disease_type_id, diagnosis_date, status, notes, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Medical record not found' });
    }
    res.json({ message: 'Medical record updated successfully' });
  });
};

// 删除慢病档案
exports.deleteMedicalRecord = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM medical_records WHERE id = ?';
  
  db.run(sql, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Medical record not found' });
    }
    res.json({ message: 'Medical record deleted successfully' });
  });
};