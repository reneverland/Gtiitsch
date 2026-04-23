# 🎓 CBIT-GTIITSch 奖学金申请系统

广东以色列理工学院奖学金申请系统 - 带本地 SQLite 数据库

## ✨ 系统特性

- ✅ 前后端分离架构
- ✅ 本地 SQLite 数据库（无需额外服务）
- ✅ 两种奖学金类型（学科特长、创新潜质）
- ✅ 申请互斥校验
- ✅ 管理员审核系统
- ✅ 现代化 UI 设计
- ✅ 完整的表单验证

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动系统

#### 开发模式（推荐）

```bash
npm run dev
```

或使用快速启动脚本：

```bash
./start.sh
```

这将同时启动：
- 后端 API 服务器: http://localhost:8500
- 前端开发服务器: http://localhost:3000

#### 仅启动后端

```bash
npm run server
```

#### 生产模式

```bash
npm run build
npm start
```

生产模式下，所有服务运行在 8500 端口。

## 📁 项目结构

```
CBIT-GTIITSch/
├── server/                    # 后端服务
│   ├── index.js              # Express 服务器入口
│   ├── database.js           # SQLite 数据库配置
│   ├── routes/               # API 路由
│   │   └── applications.js   # 申请相关 API
│   └── scholarship.db        # SQLite 数据库文件（自动生成）
├── src/                       # 前端源码
│   ├── components/           # React 组件
│   ├── pages/                # 页面组件
│   ├── services/             # API 服务
│   │   └── api.ts           # API 请求封装
│   ├── store/                # 状态管理
│   │   └── applicationStore.ts
│   └── styles/               # 样式文件
├── package.json              # 项目配置
├── vite.config.ts           # Vite 配置
└── 数据库使用说明.md         # 数据库详细文档

```

## 📊 数据库说明

### 数据库位置

`server/scholarship.db` - SQLite 数据库文件（首次启动自动创建）

### 数据库表

1. **applications** - 学生申请表
   - 存储所有学生的奖学金申请数据
   - 包含个人信息、成绩、竞赛等

2. **admins** - 管理员账号表
   - 默认账号: `admin`
   - 默认密码: `admin123`

3. **students** - 学生账号表
   - 存储学生注册信息

### 查看数据库

```bash
# 使用 SQLite 命令行工具
sqlite3 server/scholarship.db

# 查看所有申请
SELECT * FROM applications;

# 退出
.quit
```

### 重置数据库

```bash
# 删除数据库文件
rm server/scholarship.db

# 重新启动服务器，数据库会自动重新创建
npm run server
```

## 🔑 默认账号

### 管理员

- 用户名: `admin`
- 密码: `admin123`

### 学生

学生需要先注册账号才能登录申请。

## 📝 使用流程

### 学生申请流程

1. 访问首页选择奖学金类型
2. 注册/登录学生账号
3. 填写申请表单（6个步骤）
4. 提交申请
5. 等待审核结果

### 管理员审核流程

1. 访问 `/admin/login` 登录管理员后台
2. 查看所有学生申请
3. 筛选、搜索申请
4. 审核并更新状态（通过/拒绝）
5. 导出数据为 Excel

## 🔒 奖学金互斥规则

- 学生只能申请一种奖学金类型
- 一旦提交申请，无法切换类型
- 如需切换，需联系管理员

## 🛠️ 技术栈

### 前端
- React 18
- TypeScript
- Vite
- React Router

### 后端
- Node.js
- Express
- SQLite3
- CORS

### 样式
- CSS Modules
- 现代化渐变设计

## 📱 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## ⚠️ 注意事项

1. **数据持久化**: 所有数据存储在 `server/scholarship.db`，请勿删除此文件
2. **端口占用**: 确保 8500 和 3000 端口未被占用
3. **开发模式**: 前端热重载，修改代码自动刷新
4. **生产部署**: 运行 `npm run build` 后再 `npm start`

## 🐛 常见问题

### Q: 提交申请后管理员看不到？

**A**: 请检查：
1. 后端服务器是否正常运行
2. 浏览器控制台是否有错误
3. 数据库文件是否存在

### Q: 如何备份数据？

**A**: 直接复制 `server/scholarship.db` 文件即可

### Q: 忘记管理员密码？

**A**: 使用 SQLite 工具修改 admins 表，或删除数据库重新初始化

### Q: 端口冲突怎么办？

**A**: 
- 后端端口：修改 `server/index.js` 中的 `PORT`
- 前端端口：修改 `vite.config.ts` 中的 `server.port`
- 同时修改 API 代理配置

## 📚 更多文档

- [数据库详细说明](./数据库使用说明.md)
- [API 接口文档](./server/routes/applications.js)

## 🤝 技术支持

如有问题，请联系系统管理员。

## 📄 License

Copyright © 2025 广东以色列理工学院
