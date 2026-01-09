const db = require('../config/db');

// 获取所有用药记录
exports.getAllMedications = (req, res) => {
  const { patient_id, current } = req.query;
  
  let sql = `SELECT m.*, mr.id as record_id, p.name as patient_name, cdt.disease_name 
             FROM medications m 
             JOIN medical_records mr ON m.record_id = mr.id 
             JOIN patients p ON mr.patient_id = p.id 
             JOIN chronic_disease_types cdt ON mr.disease_type_id = cdt.id`;
  
  let params = [];
  let conditions = [];
  
  if (patient_id) {
    conditions.push('mr.patient_id = ?');
    params.push(patient_id);
  }
  
  if (current === 'true') {
    conditions.push('(m.end_date IS NULL OR m.end_date > date("now"))');
  }
  
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  
  sql += ' ORDER BY m.created_at DESC';
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ medications: rows });
  });
};

// 根据ID获取用药记录
exports.getMedicationById = (req, res) => {
  const { id } = req.params;
  const sql = `SELECT m.*, mr.id as record_id, p.name as patient_name 
               FROM medications m 
               JOIN medical_records mr ON m.record_id = mr.id 
               JOIN patients p ON mr.patient_id = p.id 
               WHERE m.id = ?`;
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    res.json({ medication: row });
  });
};

// 创建新用药记录
exports.createMedication = (req, res) => {
  const { record_id, medication_name, dosage, frequency, start_date, end_date, notes } = req.body;
  const sql = `INSERT INTO medications (record_id, medication_name, dosage, frequency, start_date, end_date, notes) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [record_id, medication_name, dosage, frequency, start_date, end_date, notes], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, message: 'Medication created successfully' });
  });
};

// 更新用药记录
exports.updateMedication = (req, res) => {
  const { id } = req.params;
  const { record_id, medication_name, dosage, frequency, start_date, end_date, notes } = req.body;
  const sql = `UPDATE medications SET 
               record_id = ?, medication_name = ?, dosage = ?, frequency = ?, 
               start_date = ?, end_date = ?, notes = ? 
               WHERE id = ?`;
  
  db.run(sql, [record_id, medication_name, dosage, frequency, start_date, end_date, notes, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    res.json({ message: 'Medication updated successfully' });
  });
};

// 删除用药记录
exports.deleteMedication = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM medications WHERE id = ?';
  
  db.run(sql, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    res.json({ message: 'Medication deleted successfully' });
  });
};

// 根据患者ID获取用药记录
exports.getMedicationsByPatient = (req, res) => {
  const { patientId } = req.params;
  const sql = `SELECT m.*, mr.id as record_id, cdt.disease_name 
               FROM medications m 
               JOIN medical_records mr ON m.record_id = mr.id 
               JOIN chronic_disease_types cdt ON mr.disease_type_id = cdt.id 
               WHERE mr.patient_id = ? 
               ORDER BY m.start_date DESC`;
  
  db.all(sql, [patientId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ medications: rows });
  });
};