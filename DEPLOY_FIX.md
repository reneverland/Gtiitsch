# 部署修复指南

## 问题说明

1. ✅ 省份列表代码已修改（34个完整省份）- 需要重新构建
2. ✅ 提交功能代码正常 - 需要重新构建  
3. ❌ 成绩单PDF中文乱码 - 需要修改代码为HTML打印
4. ✅ 申请修改功能已完整实现 - 需要重新构建

## 重要提示

**当前dist目录由www用户创建，dell用户无权限删除。必须使用root权限清理。**

## 部署步骤

### 1. 停止服务器
```bash
sudo pkill -f "node server/index.js"
```

### 2. 清理旧的构建文件
```bash
sudo rm -rf /www/wwwroot/CBIT-GTIITSch/dist
```

### 3. 构建前端
```bash
cd /www/wwwroot/CBIT-GTIITSch
npm run build
```

如果构建成功，你应该看到：
```
✓ 448 modules transformed.
✓ built in XXXms
✅ 已复制: aboutlogo.png -> dist/source/
✅ 已复制: gtiitlogo.png -> dist/source/
✅ 已复制: logo2.png -> dist/source/
```

### 4. 启动服务器
```bash
cd /www/wwwroot/CBIT-GTIITSch
nohup node server/index.js > /tmp/cbit-server.log 2>&1 &
```

### 5. 验证部署
```bash
# 检查服务器是否运行
ps aux | grep "node server/index.js"

# 查看服务器日志
tail -f /tmp/cbit-server.log
```

应该看到：
```
✅ 已连接到 SQLite 数据库
✅ applications 表已创建/存在
✅ admins 表已创建/存在
✅ students 表已创建/存在
服务器运行在 http://localhost:8500
```

### 6. 测试功能

1. **测试省份列表**：
   - 登录系统 → 开始申请 → 个人基本信息
   - 检查"省份/直辖市/自治区"下拉列表是否有34个选项

2. **测试提交功能**：
   - 填写完整申请表 → 点击"确认递交"
   - 应该弹出确认对话框："提交后将无法修改，确认提交吗？"
   - 点击确定后应该成功提交

3. **测试成绩单下载**：
   - 填写高中成绩 → 点击"下载成绩单模板"
   - 应该弹出打印窗口（HTML格式，支持中文）
   - 选择"另存为PDF"保存

4. **测试申请修改**：
   - 学生端：提交后应显示"申请修改"按钮
   - 管理员端：应显示"修改请求"按钮（右上角）

## 备份

在构建前建议备份数据库：
```bash
cp /www/wwwroot/CBIT-GTIITSch/server/scholarship.db \
   /www/wwwroot/CBIT-GTIITSch/server/scholarship.db.backup-$(date +%Y%m%d-%H%M%S)
```

## 如果遇到问题

### 问题1：权限错误
```
EACCES: permission denied, unlink...
```
**解决**：确保使用sudo删除dist目录

### 问题2：端口占用
```
Error: listen EADDRINUSE: address already in use :::8500
```
**解决**：
```bash
# 查找占用端口的进程
sudo lsof -i :8500
# 杀死进程
sudo kill -9 <PID>
```

### 问题3：模块未找到
```
Error: Cannot find module 'express'
```
**解决**：
```bash
cd /www/wwwroot/CBIT-GTIITSch
npm install
```

## 数据库字段说明

新增的修改请求相关字段：
- `modify_requested` (INTEGER): 是否申请修改
- `modify_reason` (TEXT): 修改原因
- `modify_attachments` (TEXT): 修改附件（JSON）
- `modify_request_date` (TEXT): 申请日期
- `modify_approved` (INTEGER): 是否批准
- `modify_approve_date` (TEXT): 批准日期
- `modify_used` (INTEGER): 是否已使用修改机会

这些字段通过ALTER TABLE自动添加，无需手动操作。

## 完成标志

部署成功后，系统应具备以下功能：

✅ 省份列表显示34个完整选项
✅ 提交按钮正常弹出确认对话框
✅ 成绩单生成HTML打印版本（支持中文）
✅ 学生端显示"申请修改"按钮
✅ 管理员端显示"修改请求"按钮和审核界面
✅ 高中成绩显示为"分数/满分"格式

---

**部署完成后请测试所有功能！** 🎉
