# 📧 邮件功能配置指南

## 📌 重要提示

当前邮件服务需要配置SMTP服务器才能正常发送邮件。

---

## 🔧 配置步骤

### 1. 选择邮件服务商

推荐使用以下邮件服务商之一：

#### 选项A：QQ邮箱（推荐）
- **SMTP服务器：** smtp.qq.com
- **端口：** 465 (SSL) 或 587 (TLS)
- **如何获取授权码：**
  1. 登录QQ邮箱网页版
  2. 设置 → 账户
  3. 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
  4. 开启"SMTP服务"
  5. 生成授权码（不是QQ密码！）

#### 选项B：163邮箱
- **SMTP服务器：** smtp.163.com
- **端口：** 465 (SSL) 或 25 (非SSL)
- **如何获取授权码：**
  1. 登录163邮箱
  2. 设置 → POP3/SMTP/IMAP
  3. 开启SMTP服务
  4. 设置客户端授权密码

#### 选项C：Gmail（国外可用）
- **SMTP服务器：** smtp.gmail.com
- **端口：** 465 (SSL) 或 587 (TLS)
- **如何配置：**
  1. 开启两步验证
  2. 生成应用专用密码

---

### 2. 修改配置文件

打开文件：`/www/wwwroot/CBIT-GTIITSch/server/emailService.js`

找到以下配置部分并修改：

```javascript
const emailConfig = {
  host: 'smtp.qq.com', // SMTP服务器地址
  port: 465, // SMTP端口
  secure: true, // 使用SSL
  auth: {
    user: 'your-email@qq.com', // 替换为您的邮箱
    pass: 'your-auth-code' // 替换为邮箱授权码
  }
};
```

**修改示例（QQ邮箱）：**
```javascript
const emailConfig = {
  host: 'smtp.qq.com',
  port: 465,
  secure: true,
  auth: {
    user: '1234567890@qq.com', // 你的QQ邮箱
    pass: 'abcdefghijklmnop' // QQ邮箱授权码
  }
};
```

**修改示例（163邮箱）：**
```javascript
const emailConfig = {
  host: 'smtp.163.com',
  port: 465,
  secure: true,
  auth: {
    user: 'yourname@163.com', // 你的163邮箱
    pass: 'your163authcode' // 163邮箱授权码
  }
};
```

---

### 3. 修改发件人显示

在 `emailService.js` 中，找到所有的 `from` 字段并修改：

```javascript
from: '"广东以色列理工学院奖学金系统" <your-email@qq.com>',
```

改为：

```javascript
from: '"广东以色列理工学院奖学金系统" <1234567890@qq.com>',
```

（替换为您配置的邮箱地址）

---

### 4. 测试邮件发送

#### 方法1：使用curl命令测试

```bash
curl -X POST http://localhost:8500/api/applications/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"cooledward@outlook.com"}'
```

#### 方法2：使用浏览器或Postman

- **URL：** `http://llmhi.com:8500/api/applications/test-email`
- **方法：** POST
- **请求头：** `Content-Type: application/json`
- **请求体：**
```json
{
  "email": "cooledward@outlook.com"
}
```

#### 预期结果：

✅ 成功：
```json
{
  "success": true,
  "message": "测试邮件已发送至 cooledward@outlook.com",
  "messageId": "<xxx@xxx.com>"
}
```

❌ 失败：
```json
{
  "success": false,
  "message": "邮件发送失败: Invalid login: 535 Error..."
}
```

---

## 🎯 邮件发送场景

### 自动发送邮件的情况：

1. **管理员审核通过申请**
   - 触发：管理员在后台点击"通过"按钮
   - 收件人：申请人邮箱
   - 内容：祝贺邮件，附带登录链接

2. **管理员审核拒绝申请**
   - 触发：管理员在后台点击"拒绝"按钮
   - 收件人：申请人邮箱
   - 内容：拒绝通知，包含审核意见

3. **测试邮件**
   - 触发：调用测试API
   - 收件人：指定的测试邮箱
   - 内容：测试邮件模板

---

## 🔍 常见问题

### 问题1：邮件发送失败 - 535 Error

**原因：** 用户名或授权码错误

**解决方法：**
1. 检查邮箱地址是否正确
2. 确认使用的是**授权码**而不是邮箱密码
3. 重新生成授权码并更新配置

---

### 问题2：邮件发送失败 - Connection timeout

**原因：** SMTP服务器或端口配置错误

**解决方法：**
1. 检查SMTP服务器地址是否正确
2. 尝试更换端口（465 → 587 或 587 → 465）
3. 检查服务器防火墙是否阻止SMTP端口

---

### 问题3：邮件进入垃圾箱

**原因：** 发件人域名未配置SPF/DKIM

**解决方法：**
1. 这是正常现象，收件人可以手动标记为"非垃圾邮件"
2. 如需改善，需配置域名的SPF和DKIM记录（高级操作）

---

### 问题4：邮件显示乱码

**原因：** 编码问题

**解决方法：**
- 当前代码已使用UTF-8编码，应该不会出现乱码
- 如果出现，检查邮件客户端设置

---

## 📊 邮件模板

### 审核通过邮件

- 标题：🎉 恭喜！您的奖学金申请已通过审核
- 内容：包含学生姓名、奖学金类型、登录链接
- 样式：绿色主题，专业美观

### 审核拒绝邮件

- 标题：关于您的奖学金申请审核结果
- 内容：包含学生姓名、奖学金类型、审核意见、鼓励语
- 样式：红色主题，委婉专业

### 测试邮件

- 标题：🧪 测试邮件 - 奖学金申请系统
- 内容：测试时间、功能确认
- 样式：绿色主题，简洁明了

---

## 🚀 快速配置命令

如果您已经有QQ邮箱和授权码，可以使用以下命令快速配置：

```bash
# 停止服务器
sudo pkill -f "node server/index.js"

# 编辑配置文件
vi /www/wwwroot/CBIT-GTIITSch/server/emailService.js

# 修改以下内容：
# - user: 'your-email@qq.com' → 你的QQ邮箱
# - pass: 'your-auth-code' → 你的QQ邮箱授权码
# - 所有的 from 字段中的邮箱地址

# 保存后重启服务器
cd /www/wwwroot/CBIT-GTIITSch && nohup node server/index.js > /tmp/cbit-server.log 2>&1 &

# 测试邮件发送
curl -X POST http://localhost:8500/api/applications/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"cooledward@outlook.com"}'
```

---

## 📝 配置检查清单

在部署前，请确认以下项目已完成：

- [ ] 已选择邮件服务商（QQ/163/Gmail等）
- [ ] 已获取邮箱授权码（不是密码！）
- [ ] 已修改 `emailService.js` 中的 `emailConfig`
- [ ] 已修改所有 `from` 字段的邮箱地址
- [ ] 已重启Node.js服务器
- [ ] 已测试邮件发送到 cooledward@outlook.com
- [ ] 已验证收件箱收到测试邮件
- [ ] 已测试管理员审核时的邮件发送

---

## 🎉 配置完成

配置完成后，系统将在以下情况自动发送邮件：

1. ✅ **管理员审核通过** → 自动发送祝贺邮件
2. ❌ **管理员审核拒绝** → 自动发送拒绝通知（含审核意见）

**测试邮件地址：** cooledward@outlook.com

---

## 📞 技术支持

如有问题，请检查：
1. 服务器日志：`tail -f /tmp/cbit-server.log`
2. 邮箱授权码是否正确
3. SMTP服务器和端口配置
4. 服务器防火墙设置

**作者：** Ren CBIT  
**GitHub：** https://github.com/reneverland/  
**更新时间：** 2026-01-24

---

✨ **祝您配置顺利！** ✨
