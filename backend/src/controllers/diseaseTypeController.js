const db = require('../config/db');

// 获取所有慢性病类型
exports.getAllDiseaseTypes = (req, res) => {
  const sql = 'SELECT * FROM chronic_disease_types ORDER BY disease_name';
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ diseaseTypes: rows });
  });
};

// 根据ID获取慢性病类型
exports.getDiseaseTypeById = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM chronic_disease_types WHERE id = ?';
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Disease type not found' });
    }
    res.json({ diseaseType: row });
  });
};

// 创建新慢性病类型
exports.createDiseaseType = (req, res) => {
  const { disease_code, disease_name, description } = req.body;
  const sql = `INSERT INTO chronic_disease_types (disease_code, disease_name, description) 
               VALUES (?, ?, ?)`;
  
  db.run(sql, [disease_code, disease_name, description], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, message: 'Disease type created successfully' });
  });
};

// 更新慢性病类型
exports.updateDiseaseType = (req, res) => {
  const { id } = req.params;
  const { disease_code, disease_name, description } = req.body;
  const sql = `UPDATE chronic_disease_types SET 
               disease_code = ?, disease_name = ?, description = ? 
               WHERE id = ?`;
  
  db.run(sql, [disease_code, disease_name, description, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Disease type not found' });
    }
    res.json({ message: 'Disease type updated successfully' });
  });
};

// 删除慢性病类型
exports.deleteDiseaseType = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM chronic_disease_types WHERE id = ?';
  
  db.run(sql, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Disease type not found' });
    }
    res.json({ message: 'Disease type deleted successfully' });
  });
};

// 初始化基础慢性病类型数据
exports.initializeDiseaseTypes = () => {
  const defaultDiseaseTypes = [
    { code: 'DM', name: '糖尿病', description: '以高血糖为特征的代谢性疾病' },
    { code: 'HTN', name: '高血压', description: '以体循环动脉血压增高为主要特征' },
    { code: 'CHD', name: '冠心病', description: '冠状动脉粥样硬化性心脏病' },
    { code: 'COPD', name: '慢性阻塞性肺疾病', description: '以持续气流受限为特征的疾病' },
    { code: 'CKD', name: '慢性肾脏病', description: '肾脏结构和功能异常超过3个月' }
  ];

  defaultDiseaseTypes.forEach(diseaseType => {
    const checkSql = 'SELECT COUNT(*) as count FROM chronic_disease_types WHERE disease_code = ?';
    db.get(checkSql, [diseaseType.code], (err, row) => {
      if (err || row.count > 0) return;
      
      const insertSql = `INSERT INTO chronic_disease_types (disease_code, disease_name, description) 
                         VALUES (?, ?, ?)`;
      db.run(insertSql, [diseaseType.code, diseaseType.name, diseaseType.description]);
    });
  });
};