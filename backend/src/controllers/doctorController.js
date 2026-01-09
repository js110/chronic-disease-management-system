const db = require('../config/db');

// 获取所有医生
exports.getAllDoctors = (req, res) => {
  const sql = 'SELECT * FROM doctors ORDER BY created_at DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ doctors: rows });
  });
};

// 根据ID获取医生
exports.getDoctorById = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM doctors WHERE id = ?';
  db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json({ doctor: row });
  });
};

// 创建新医生
exports.createDoctor = (req, res) => {
  const { doctor_id, name, department, phone, email, specialty } = req.body;
  const sql = `INSERT INTO doctors (doctor_id, name, department, phone, email, specialty) 
               VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [doctor_id, name, department, phone, email, specialty], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, message: 'Doctor created successfully' });
  });
};

// 更新医生信息
exports.updateDoctor = (req, res) => {
  const { id } = req.params;
  const { doctor_id, name, department, phone, email, specialty } = req.body;
  const sql = `UPDATE doctors SET 
               doctor_id = ?, name = ?, department = ?, phone = ?, email = ?, specialty = ?, 
               updated_at = CURRENT_TIMESTAMP 
               WHERE id = ?`;
  
  db.run(sql, [doctor_id, name, department, phone, email, specialty, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json({ message: 'Doctor updated successfully' });
  });
};

// 删除医生
exports.deleteDoctor = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM doctors WHERE id = ?';
  
  db.run(sql, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json({ message: 'Doctor deleted successfully' });
  });
};