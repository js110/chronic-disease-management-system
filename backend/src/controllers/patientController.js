// 患者控制器
const db = require('../config/db');

// 获取所有患者
exports.getAllPatients = (req, res) => {
  const sql = 'SELECT * FROM patients ORDER BY created_at DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ patients: rows });
  });
};

// 根据ID获取患者
exports.getPatientById = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM patients WHERE id = ?';
  db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json({ patient: row });
  });
};

// 创建新患者
exports.createPatient = (req, res) => {
  const { patient_id, name, gender, birth_date, phone, email, address, medical_history, allergies, avatar_url } = req.body;
  const sql = `INSERT INTO patients (patient_id, name, gender, birth_date, phone, email, address, medical_history, allergies, avatar_url) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [patient_id, name, gender, birth_date, phone, email, address, medical_history, allergies, avatar_url], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, message: 'Patient created successfully' });
  });
};

// 更新患者信息
exports.updatePatient = (req, res) => {
  const { id } = req.params;
  const { patient_id, name, gender, birth_date, phone, email, address, medical_history, allergies, avatar_url } = req.body;
  const sql = `UPDATE patients SET 
               patient_id = ?, name = ?, gender = ?, birth_date = ?, 
               phone = ?, email = ?, address = ?, medical_history = ?, allergies = ?, avatar_url = ?, 
               updated_at = CURRENT_TIMESTAMP 
               WHERE id = ?`;
  
  db.run(sql, [patient_id, name, gender, birth_date, phone, email, address, medical_history, allergies, avatar_url, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json({ message: 'Patient updated successfully' });
  });
};

// 删除患者
exports.deletePatient = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM patients WHERE id = ?';
  
  db.run(sql, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json({ message: 'Patient deleted successfully' });
  });
};