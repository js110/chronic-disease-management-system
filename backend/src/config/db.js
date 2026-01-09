const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 确保db目录存在
const dbDir = path.join(__dirname, '../../db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 创建数据库连接
const db = new sqlite3.Database(path.join(dbDir, 'chronic_disease.db'));

// 初始化数据库表
const initDB = () => {
  const schema = `
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      gender TEXT,
      birth_date DATE,
      phone TEXT,
      email TEXT,
      address TEXT,
      medical_history TEXT,
      allergies TEXT,
      avatar_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctor_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      department TEXT,
      phone TEXT,
      email TEXT,
      specialty TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chronic_disease_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      disease_code TEXT UNIQUE NOT NULL,
      disease_name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS medical_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      disease_type_id INTEGER NOT NULL,
      diagnosis_date DATE,
      status TEXT DEFAULT 'active',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (disease_type_id) REFERENCES chronic_disease_types(id)
    );

    CREATE TABLE IF NOT EXISTS health_indicators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_id INTEGER NOT NULL,
      indicator_type TEXT NOT NULL,
      value REAL NOT NULL,
      unit TEXT,
      recorded_date DATE NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (record_id) REFERENCES medical_records(id)
    );

    CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_id INTEGER NOT NULL,
      medication_name TEXT NOT NULL,
      dosage TEXT,
      frequency TEXT,
      start_date DATE,
      end_date DATE,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (record_id) REFERENCES medical_records(id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      associated_id INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS data_exports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      export_type TEXT NOT NULL,
      file_path TEXT NOT NULL,
      export_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      exported_by INTEGER NOT NULL
    );
  `;

  db.serialize(() => {
    db.exec(schema, (err) => {
      if (err) {
        console.error('Error initializing database:', err);
      } else {
        console.log('Database initialized successfully');
      }
    });
  });
};

// 初始化数据库
initDB();

// 初始化基础数据
const initializeBaseData = () => {
  // 初始化慢性病类型
  const diseaseTypeController = require('../controllers/diseaseTypeController');
  diseaseTypeController.initializeDiseaseTypes();
  
  // 初始化管理员用户
  const bcrypt = require('bcryptjs');
  const checkAdminSql = 'SELECT COUNT(*) as count FROM users WHERE role = "admin"';
  db.get(checkAdminSql, [], async (err, row) => {
    if (err || row.count > 0) return;
    
    try {
      const password_hash = await bcrypt.hash('admin123', 10);
      const insertAdminSql = `INSERT INTO users (username, password_hash, role) 
                              VALUES (?, ?, ?)`;
      db.run(insertAdminSql, ['admin', password_hash, 'admin'], function(err) {
        if (err) {
          console.error('创建管理员用户失败:', err);
        } else {
          console.log('管理员用户创建成功 - 用户名: admin, 密码: admin123');
        }
      });
    } catch (error) {
      console.error('创建管理员用户失败:', error);
    }
  });
};

// 延迟初始化基础数据，确保表已创建
setTimeout(initializeBaseData, 1000);

module.exports = db;