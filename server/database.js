const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const DB_PATH = path.join(__dirname, 'scholarship.db');

// 创建数据库连接
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err.message);
  } else {
    console.log('✅ 已连接到 SQLite 数据库');
  }
});

// 初始化数据库表
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 创建学生申请表
      db.run(`
        CREATE TABLE IF NOT EXISTS applications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id_card TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          family_name TEXT,
          given_name TEXT,
          gender TEXT,
          ethnicity TEXT,
          birth_date TEXT,
          email TEXT,
          school TEXT,
          subjects TEXT,
          high_school_class TEXT,
          class_teacher TEXT,
          class_teacher_phone TEXT,
          school_address TEXT,
          parent_name TEXT,
          parent_phone TEXT,
          parent_wechat TEXT,
          country TEXT,
          province TEXT,
          address TEXT,
          zip_code TEXT,
          scholarship_type TEXT NOT NULL,
          exam_name TEXT,
          total_score TEXT,
          chinese TEXT,
          math TEXT,
          english TEXT,
          physics TEXT,
          chemistry TEXT,
          class_rank TEXT,
          total_students TEXT,
          exam_name2 TEXT,
          total_score2 TEXT,
          chinese2 TEXT,
          math2 TEXT,
          english2 TEXT,
          physics2 TEXT,
          chemistry2 TEXT,
          class_rank2 TEXT,
          total_students2 TEXT,
          competition_awards TEXT,
          id_card_attachment TEXT,
          score_sheet_attachment TEXT,
          competition_attachments TEXT,
          other_attachments TEXT,
          status TEXT DEFAULT 'pending',
          submit_date TEXT NOT NULL,
          review_date TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('❌ 创建 applications 表失败:', err.message);
          reject(err);
        } else {
          console.log('✅ applications 表已创建/存在');
          
          // 为已存在的表添加附件字段（如果不存在）
          db.run(`ALTER TABLE applications ADD COLUMN id_card_attachment TEXT`, () => {});
          db.run(`ALTER TABLE applications ADD COLUMN score_sheet_attachment TEXT`, () => {});
          db.run(`ALTER TABLE applications ADD COLUMN competition_attachments TEXT`, () => {});
          db.run(`ALTER TABLE applications ADD COLUMN other_attachments TEXT`, () => {});
          
          // 添加修改请求相关字段
          db.run(`ALTER TABLE applications ADD COLUMN modify_requested INTEGER DEFAULT 0`, () => {});
          db.run(`ALTER TABLE applications ADD COLUMN modify_reason TEXT`, () => {});
          db.run(`ALTER TABLE applications ADD COLUMN modify_attachments TEXT`, () => {});
          db.run(`ALTER TABLE applications ADD COLUMN modify_request_date TEXT`, () => {});
          db.run(`ALTER TABLE applications ADD COLUMN modify_approved INTEGER DEFAULT 0`, () => {});
          db.run(`ALTER TABLE applications ADD COLUMN modify_approve_date TEXT`, () => {});
          db.run(`ALTER TABLE applications ADD COLUMN modify_used INTEGER DEFAULT 0`, () => {});
          
          // 添加学校省市和成绩满分字段
          db.run(`ALTER TABLE applications ADD COLUMN school_province TEXT`, () => {});
          db.run(`ALTER TABLE applications ADD COLUMN school_city TEXT`, () => {});
          db.run(`ALTER TABLE applications ADD COLUMN total_score_max TEXT`, () => {});
          db.run(`ALTER TABLE applications ADD COLUMN chinese_max TEXT`, () => {});
          db.run(`ALTER TABLE applications ADD COLUMN math_max TEXT`, () => {});
          db.run(`ALTER TABLE applications ADD COLUMN english_max TEXT`, () => {});
          db.run(`ALTER TABLE applications ADD COLUMN physics_max TEXT`, () => {});
          db.run(`ALTER TABLE applications ADD COLUMN chemistry_max TEXT`, () => {});
          db.run(`ALTER TABLE applications ADD COLUMN total_score_max2 TEXT`, () => {});
          db.run(`ALTER TABLE applications ADD COLUMN chinese_max2 TEXT`, () => {});
          db.run(`ALTER TABLE applications ADD COLUMN math_max2 TEXT`, () => {});
          db.run(`ALTER TABLE applications ADD COLUMN english_max2 TEXT`, () => {});
          db.run(`ALTER TABLE applications ADD COLUMN physics_max2 TEXT`, () => {});
          db.run(`ALTER TABLE applications ADD COLUMN chemistry_max2 TEXT`, () => {});

          // 归档（软删除）字段
          db.run(`ALTER TABLE applications ADD COLUMN is_archived INTEGER DEFAULT 0`, () => {});
          db.run(`ALTER TABLE applications ADD COLUMN archived_at TEXT`, () => {});
        }
      });

      // 修改请求审计日志表（每次学生申请修改都记录一条，永久保留）
      db.run(`
        CREATE TABLE IF NOT EXISTS modify_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          application_id INTEGER,
          student_id_card TEXT NOT NULL,
          name TEXT,
          scholarship_type TEXT,
          reason TEXT,
          attachments TEXT,
          request_date TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('❌ 创建 modify_history 表失败:', err.message);
        } else {
          console.log('✅ modify_history 表已创建/存在');
        }
      });

      // 创建管理员表
      db.run(`
        CREATE TABLE IF NOT EXISTS admins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('❌ 创建 admins 表失败:', err.message);
          reject(err);
        } else {
          console.log('✅ admins 表已创建/存在');
          
          // 插入默认管理员账号（如果不存在）
          db.run(`
            INSERT OR IGNORE INTO admins (username, password)
            VALUES ('admin', 'Gtiit@2026#RenCBIT!9X')
          `, (err) => {
            if (err) {
              console.error('❌ 插入默认管理员失败:', err.message);
            } else {
              console.log('✅ 默认管理员账号已设置 (username: admin, password: Gtiit@2026#RenCBIT!9X)');
            }
          });
        }
      });

      // 创建学生账号表
      db.run(`
        CREATE TABLE IF NOT EXISTS students (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          id_card TEXT UNIQUE NOT NULL,
          full_name TEXT NOT NULL,
          phone TEXT NOT NULL,
          password TEXT NOT NULL,
          salt TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('❌ 创建 students 表失败:', err.message);
          reject(err);
        } else {
          console.log('✅ students 表已创建/存在');
          db.run(`ALTER TABLE students ADD COLUMN phone TEXT`, () => {});
          db.run(`ALTER TABLE students ADD COLUMN salt TEXT`, () => {});
        }
      });

      // 创建短信验证码表
      db.run(`
        CREATE TABLE IF NOT EXISTS sms_codes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          phone TEXT NOT NULL,
          code TEXT NOT NULL,
          type TEXT NOT NULL,
          used INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('❌ 创建 sms_codes 表失败:', err.message);
        } else {
          console.log('✅ sms_codes 表已创建/存在');
        }
      });

      // 创建邮件配置表
      db.run(`
        CREATE TABLE IF NOT EXISTS email_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          smtp_host TEXT NOT NULL,
          smtp_port INTEGER NOT NULL,
          smtp_secure INTEGER DEFAULT 1,
          smtp_user TEXT NOT NULL,
          smtp_pass TEXT NOT NULL,
          sender_name TEXT DEFAULT '广东以色列理工学院',
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('❌ 创建 email_settings 表失败:', err.message);
          reject(err);
        } else {
          console.log('✅ email_settings 表已创建/存在');
          resolve();
        }
      });
    });
  });
};

// 辅助函数：运行SQL查询
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

// 辅助函数：查询单条记录
const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// 辅助函数：查询多条记录
const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

module.exports = {
  db,
  initDatabase,
  run,
  get,
  all
};
