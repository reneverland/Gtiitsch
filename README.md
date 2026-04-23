# 广东以色列理工学院奖学金申请系统

**GTIIT Scholarship Application System**

> 面向广东以色列理工学院（GTIIT）学科特长奖学金与创新潜质奖学金的全流程在线申请与管理平台。

---

## 作者 Author

**Ren SHI**
Centre for Bioinformatics Intelligence Technology (CBIT), The Chinese University of Hong Kong
[https://cbit.cuhk.edu.cn/profile.html](https://cbit.cuhk.edu.cn/profile.html)

---

## 技术栈 Tech Stack

### 前端 Frontend

| 技术 | 版本 | 说明 |
|------|------|------|
| [React](https://react.dev/) | 18 | UI 框架，函数式组件 + Hooks |
| [TypeScript](https://www.typescriptlang.org/) | 5 | 类型安全 |
| [Vite](https://vitejs.dev/) | 5 | 构建工具，极速 HMR |
| [React Router](https://reactrouter.com/) | 6 | 客户端路由 |
| [JSZip](https://stuk.github.io/jszip/) | 3 | 附件打包为 zip |
| [SheetJS (xlsx)](https://sheetjs.com/) | 0.18 | 数据导出 Excel |
| CSS Modules | — | 组件级样式隔离 |

### 后端 Backend

| 技术 | 说明 |
|------|------|
| [Node.js](https://nodejs.org/) | 运行时环境 |
| [Express](https://expressjs.com/) | HTTP 服务框架 |
| [SQLite3](https://www.sqlite.org/) | 嵌入式关系数据库，零配置部署 |
| [better-sqlite3 / sqlite3](https://github.com/TryGhost/node-sqlite3) | Node.js SQLite 驱动 |
| [nodemailer](https://nodemailer.com/) | 邮件通知服务 |
| [cors](https://github.com/expressjs/cors) | 跨域处理 |

---

## 核心功能 Features

### 学生端
- 手机号注册 / 登录，短信验证码
- 两种奖学金类型选择：**学科特长奖** / **创新潜质奖**（申请互斥）
- 多步骤申请表单（申请须知 → 基本信息 → 成绩 → 竞赛 → 附件 → 提交）
- 附件上传（身份证、成绩表、获奖证书等，base64 存储）
- 本地草稿自动保存（`localStorage`），刷新不丢失
- 提交后一次修改机会（需填写修改理由及佐证材料）
- 「我的中心」实时查询申请状态与审核结果

### 管理员端
- 管理员登录（`/admin/login`）
- 申请列表：支持奖学金类型筛选、姓名 / 学校 / 邮箱搜索
- 30 秒自动刷新 + 手动刷新，防止遗漏
- 按需加载单条完整数据（含附件 base64），大幅降低列表接口体积
- 附件在线预览（Blob URL 新窗口打开）及下载
- **📦 下载全部附件 (zip)**：一键打包单个申请人所有附件，按 `姓名_身份证尾4位` 命名
- **审核**：通过 / 拒绝，可填写审核意见
- **归档管理**：删除操作改为软归档，支持 tab 切换「当前申请 / 已归档」，可恢复或永久删除
- **✏️ 修改请求历史**：永久审计日志，附件可预览 / 下载，可跳转对应申请
- **🔄 转为创新潜质奖**：仅学科特长申请详情显示，一键变更奖学金类型
- 批量导出 Excel（全部 / 选中）
- 邮件通知配置与发送

---

## 数据库结构 Database Schema

数据库文件路径：`server/scholarship.db`（SQLite，首次启动自动创建）

| 表名 | 说明 |
|------|------|
| `applications` | 学生申请主表，含所有信息与附件（base64） |
| `admins` | 管理员账号 |
| `students` | 学生账号（手机号 + 验证码） |
| `modify_history` | 学生修改申请审计日志（永久保留，不可覆盖） |

`applications` 表关键字段：

```
id, student_id_card, name, scholarship_type,
status (pending / approved / rejected / not_submitted),
is_archived, archived_at,
modify_requested, modify_used, modify_reason, modify_attachments,
id_card_attachment, score_sheet_attachment,
competition_attachments, other_attachments
```

---

## 项目结构 Project Structure

```
GTIIT/
├── server/                        # 后端
│   ├── index.js                   # Express 入口，静态文件托管
│   ├── database.js                # 数据库初始化 & 表结构
│   ├── emailService.js            # 邮件服务
│   ├── smsService.js              # 短信服务
│   └── routes/
│       ├── applications.js        # 申请 CRUD、审核、归档、附件 API
│       └── auth.js                # 管理员登录
├── src/                           # 前端源码
│   ├── pages/
│   │   ├── WelcomePage.tsx        # 首页 / 奖学金介绍
│   │   ├── StudentRegister.tsx    # 学生注册 / 登录
│   │   ├── StudentApplication.tsx # 申请表单（多步骤）
│   │   ├── MyDashboard.tsx        # 学生个人中心
│   │   ├── AdminLogin.tsx         # 管理员登录
│   │   └── AdminDashboard.tsx     # 管理员后台
│   ├── components/
│   │   ├── ApplicationDetail.tsx  # 申请详情弹窗（附件预览、zip 导出、奖项转换）
│   │   ├── EmailModal.tsx         # 邮件发送弹窗
│   │   ├── EmailSettings.tsx      # 邮件服务配置
│   │   └── SchoolSelector.tsx     # 学校选择器
│   ├── services/
│   │   └── api.ts                 # 前端 API 客户端
│   ├── store/
│   │   └── applicationStore.ts    # 申请本地状态管理
│   └── styles/
│       └── global.css
├── source/                        # 静态文档（PDF、Excel 模板）
├── dist/                          # 构建产物（生产部署）
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 快速开始 Quick Start

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

- 前端：http://localhost:3000
- 后端 API：http://localhost:8500

### 生产部署

```bash
npm run build
# 补全静态文档（PDF/Excel 模板）
cp source/*.pdf source/*.xlsx dist/source/
# 启动后端（同时托管前端静态文件）
node server/index.js
```

所有服务运行在端口 **8500**。

---

## API 接口一览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/applications/all` | 获取所有当前（未归档）申请（轻量，不含附件） |
| GET | `/applications/all/archived` | 获取已归档申请 |
| GET | `/applications/:id` | 获取单条完整申请（含附件 base64） |
| POST | `/applications/submit` | 提交申请 |
| PATCH | `/applications/:id/status` | 更新审核状态 |
| PATCH | `/applications/:id/scholarship-type` | 修改奖学金类型 |
| DELETE | `/applications/:id` | 软归档申请 |
| POST | `/applications/:id/restore` | 从归档恢复 |
| DELETE | `/applications/:id/force` | 永久删除（不可恢复） |
| POST | `/applications/request-modify` | 学生申请修改（同时写入审计日志） |
| GET | `/applications/pending-modifications` | 获取修改请求历史（modify_history 表） |

---

## 注意事项

1. **数据安全**：`server/scholarship.db` 含真实用户数据，**严禁上传到公开仓库**（已加入 `.gitignore`）
2. **附件存储**：附件以 base64 形式存入 SQLite，单条申请数据可达数 MB，列表接口已做字段裁剪优化
3. **归档 vs 删除**：管理员「删除」操作为软归档，可在「已归档」tab 恢复；永久删除需二次确认

---

## License

Copyright © 2026 广东以色列理工学院 (GTIIT)
Developed by **Ren SHI** — [CBIT, CUHK](https://cbit.cuhk.edu.cn/profile.html)
