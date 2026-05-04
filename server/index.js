require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { execSync } = require('child_process');
const db = require('./database');
const applicationRoutes = require('./routes/applications');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 8500;

// 中间件
app.use(cors());
app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '200mb' }));

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务器运行正常' });
});

// 服务静态文件（始终启用）
app.use(express.static(path.join(__dirname, '../dist')));

// 所有非 API 路由都返回 index.html（支持前端路由）
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// 初始化数据库并启动服务器
db.initDatabase()
  .then(() => {
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ 服务器运行在 http://localhost:${PORT}`);
      console.log(`✅ 数据库已初始化`);
      console.log(`📁 静态文件目录: ${path.join(__dirname, '../dist')}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️  端口 ${PORT} 已被占用，正在释放...`);
        try {
          execSync(`fuser -k ${PORT}/tcp`, { stdio: 'ignore' });
          console.log(`✅ 端口已释放，3秒后重启...`);
          setTimeout(() => {
            app.listen(PORT, '0.0.0.0', () => {
              console.log(`✅ 服务器重启成功，运行在 http://localhost:${PORT}`);
            });
          }, 3000);
        } catch (e) {
          console.error('❌ 释放端口失败，请手动执行: fuser -k ' + PORT + '/tcp');
          process.exit(1);
        }
      } else {
        console.error('❌ 服务器错误:', err);
        process.exit(1);
      }
    });
  })
  .catch(err => {
    console.error('❌ 数据库初始化失败:', err);
    process.exit(1);
  });

module.exports = app;
