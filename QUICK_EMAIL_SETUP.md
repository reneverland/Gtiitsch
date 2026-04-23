# 📧 邮件功能快速配置指南

**配置时间：** 5分钟  
**难度：** ⭐⭐☆☆☆（简单）

---

## 🎯 配置目标

让系统能够发送邮件通知到 `cooledward@outlook.com`

---

## ✅ 方法一：使用QQ邮箱（推荐）

### 第1步：获取QQ邮箱授权码（3分钟）

1. **登录QQ邮箱网页版**
   - 访问：https://mail.qq.com
   - 使用您的QQ号和密码登录

2. **进入设置页面**
   - 点击右上角"设置"
   - 选择"账户"标签

3. **开启SMTP服务**
   - 往下滚动，找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
   - 找到"SMTP服务"那一行
   - 点击"开启"按钮

4. **生成授权码**
   - 点击"生成授权码"
   - 按提示发送短信验证（手机收到验证码后回复）
   - **复制显示的16位授权码**（例如：abcdefghijklmnop）
   - **重要：** 这不是QQ密码，是单独的授权码！

### 第2步：修改配置文件（1分钟）

**方法A：手动修改**

```bash
# 编辑配置文件
vi /www/wwwroot/CBIT-GTIITSch/server/emailService.js
```

找到第7-14行，修改为：
```javascript
const emailConfig = {
  host: 'smtp.qq.com',
  port: 465,
  secure: true,
  auth: {
    user: '你的QQ号@qq.com',        // 例如：1234567890@qq.com
    pass: '你刚复制的16位授权码'   // 例如：abcdefghijklmnop
  }
};
```

**同时修改3处发件人地址：**

搜索 `from:` （共3处），都改为：
```javascript
from: '"广东以色列理工学院奖学金系统" <你的QQ号@qq.com>',
```

**保存并退出：** 按 `Esc`，输入 `:wq`，回车

---

**方法B：一键脚本**

```bash
# 设置变量（替换为你的信息）
QQ_EMAIL="1234567890@qq.com"
QQ_AUTH_CODE="abcdefghijklmnop"

# 一键修改
cd /www/wwwroot/CBIT-GTIITSch/server
sed -i "s/user: 'your-email@qq.com'/user: '$QQ_EMAIL'/g" emailService.js
sed -i "s/pass: 'your-auth-code'/pass: '$QQ_AUTH_CODE'/g" emailService.js
sed -i "s/<your-email@qq.com>/<$QQ_EMAIL>/g" emailService.js

echo "✅ 配置已更新！"
```

### 第3步：重启服务器（30秒）

```bash
# 停止旧服务器
sudo pkill -f "node server/index.js"

# 启动新服务器
cd /www/wwwroot/CBIT-GTIITSch && nohup node server/index.js > /tmp/cbit-server.log 2>&1 &

# 等待3秒
sleep 3

# 验证服务器运行
ps aux | grep "node server/index.js" | grep -v grep
```

### 第4步：测试邮件发送（30秒）

```bash
# 运行测试脚本
bash /www/wwwroot/CBIT-GTIITSch/test-email.sh
```

**预期结果：**
```
✅ 测试邮件发送成功！
📬 请检查以下邮箱：
   收件箱: cooledward@outlook.com
```

**检查邮箱：**
- 登录 cooledward@outlook.com
- 查看收件箱（如果没有，检查垃圾邮件文件夹）
- 应该收到标题为"🧪 测试邮件 - 奖学金申请系统"的邮件

---

## ✅ 方法二：使用163邮箱

如果您有163邮箱，也可以使用：

### 配置示例：

```javascript
const emailConfig = {
  host: 'smtp.163.com',
  port: 465,
  secure: true,
  auth: {
    user: 'yourname@163.com',
    pass: '你的163授权码'
  }
};
```

### 获取163授权码：

1. 登录 https://mail.163.com
2. 设置 → POP3/SMTP/IMAP
3. 开启SMTP服务
4. 设置客户端授权密码

---

## 🔧 完整配置命令（复制粘贴）

**请先替换下面的邮箱和授权码，然后复制整段执行：**

```bash
#!/bin/bash
# ===== 请在这里修改您的信息 =====
MY_EMAIL="1234567890@qq.com"          # ← 改为你的QQ邮箱
MY_AUTH_CODE="abcdefghijklmnop"       # ← 改为你的QQ邮箱授权码
# ================================

echo "📧 开始配置邮件服务..."

# 1. 备份原配置
cp /www/wwwroot/CBIT-GTIITSch/server/emailService.js \
   /www/wwwroot/CBIT-GTIITSch/server/emailService.js.backup.$(date +%Y%m%d%H%M%S)
echo "✅ 已备份原配置"

# 2. 修改配置
cd /www/wwwroot/CBIT-GTIITSch/server
sed -i "s/user: 'your-email@qq.com'/user: '$MY_EMAIL'/g" emailService.js
sed -i "s/pass: 'your-auth-code'/pass: '$MY_AUTH_CODE'/g" emailService.js
sed -i "s/<your-email@qq.com>/<$MY_EMAIL>/g" emailService.js
echo "✅ 配置已更新"

# 3. 重启服务器
echo "🔄 重启服务器..."
sudo pkill -f "node server/index.js"
sleep 2
cd /www/wwwroot/CBIT-GTIITSch && nohup node server/index.js > /tmp/cbit-server.log 2>&1 &
sleep 3
echo "✅ 服务器已重启"

# 4. 测试邮件发送
echo "📨 发送测试邮件..."
bash /www/wwwroot/CBIT-GTIITSch/test-email.sh

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "配置完成！请检查以下内容："
echo "1. 上方是否显示 ✅ 测试邮件发送成功"
echo "2. 登录 cooledward@outlook.com 查看邮件"
echo "3. 如果没收到，检查垃圾邮件文件夹"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

---

## ⚠️ 常见问题

### Q1: 邮件发送失败 - 535 Error

**错误信息：**
```
Invalid login: 535 Login fail...
```

**原因：** 邮箱地址或授权码错误

**解决方法：**
1. 检查邮箱地址是否正确
2. 确认使用的是**授权码**而不是QQ密码
3. 重新生成授权码并更新配置

---

### Q2: 邮件进入垃圾箱

**原因：** 这是正常现象（发件人域名未配置SPF）

**解决方法：**
1. 检查垃圾邮件文件夹
2. 将发件人标记为"非垃圾邮件"
3. 添加到通讯录

---

### Q3: 连接超时

**错误信息：**
```
ECONNECTION timeout
```

**原因：** SMTP服务器或端口配置错误

**解决方法：**
1. 检查SMTP服务器地址
2. 尝试更换端口（465 → 587 或 587 → 465）
3. 检查防火墙设置

---

### Q4: 如何恢复原配置？

**恢复备份：**
```bash
# 查看备份文件
ls -lah /www/wwwroot/CBIT-GTIITSch/server/emailService.js.backup*

# 恢复最新备份（替换时间戳）
cp /www/wwwroot/CBIT-GTIITSch/server/emailService.js.backup.20260125001000 \
   /www/wwwroot/CBIT-GTIITSch/server/emailService.js

# 重启服务器
sudo pkill -f "node server/index.js"
cd /www/wwwroot/CBIT-GTIITSch && nohup node server/index.js > /tmp/cbit-server.log 2>&1 &
```

---

## ✅ 配置验证清单

配置完成后，请检查：

- [ ] 已获取QQ邮箱授权码
- [ ] 已修改 `emailService.js` 配置（user和pass）
- [ ] 已修改所有发件人地址（3处from）
- [ ] 已重启服务器
- [ ] 运行测试脚本显示"✅ 测试邮件发送成功"
- [ ] cooledward@outlook.com 收到测试邮件
- [ ] 邮件格式美观，中文显示正常

---

## 📋 测试完整流程

配置完成后，测试审核邮件：

1. **管理员审核申请**
   - 登录 http://llmhi.com:8500/admin
   - 找到一个待审核的申请
   - 点击"通过"或"拒绝"

2. **检查申请人邮箱**
   - 登录申请人的邮箱
   - 应该收到审核结果通知
   - 审核通过：标题包含"🎉 恭喜"
   - 审核拒绝：标题包含"审核结果通知"

3. **验证邮件内容**
   - 邮件格式美观
   - 中文显示正常
   - 包含学生姓名
   - 包含奖学金类型
   - 包含登录链接

---

## 📧 邮件模板示例

### 审核通过邮件

```
主题：🎉 恭喜！您的奖学金申请已通过审核

尊敬的 张三 同学：

恭喜您！您申请的 创新潜质奖学金 已通过审核！

📌 重要提示：
• 请登录系统查看详细审核结果
• 如有疑问，请联系招生办公室
• 请关注后续通知邮件

[登录查看详情]

━━━━━━━━━━━━━━━━━━━━━━
此邮件由系统自动发送，请勿直接回复。
广东以色列理工学院招生办公室
```

### 审核拒绝邮件

```
主题：关于您的奖学金申请审核结果

尊敬的 李四 同学：

感谢您申请我校的 学科特长奖学金。经过认真审核，很遗憾地通知您，您的申请未能通过本次审核。

📌 审核意见：
[管理员填写的具体原因]

我们鼓励您：
• 继续努力学习，提升自己的综合素质
• 关注我校其他奖学金项目

[登录查看详情]

━━━━━━━━━━━━━━━━━━━━━━
此邮件由系统自动发送，请勿直接回复。
广东以色列理工学院招生办公室
```

---

## 🎉 配置完成！

**下一步：**
1. ✅ 测试管理员审核功能
2. ✅ 测试邮件自动发送
3. ✅ 验证学生端状态同步

**系统访问地址：**
- 前端：http://llmhi.com:8500
- 管理员：http://llmhi.com:8500/admin

**测试邮箱：** cooledward@outlook.com

---

✨ **所有功能已就绪！开始测试吧！** ✨
