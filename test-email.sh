#!/bin/bash
# 邮件功能测试脚本

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📧 奖学金系统 - 邮件功能测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 测试收件人邮箱
TEST_EMAIL="cooledward@outlook.com"

echo "🎯 测试收件人: $TEST_EMAIL"
echo ""

# 检查服务器是否运行
echo "1️⃣ 检查服务器状态..."
if curl -s http://localhost:8500/api/health > /dev/null 2>&1; then
  echo "   ✅ 服务器运行正常"
else
  echo "   ❌ 服务器未运行，请先启动服务器"
  echo "   启动命令: cd /www/wwwroot/CBIT-GTIITSch && nohup node server/index.js > /tmp/cbit-server.log 2>&1 &"
  exit 1
fi
echo ""

# 发送测试邮件
echo "2️⃣ 发送测试邮件到 $TEST_EMAIL..."
RESPONSE=$(curl -s -X POST http://localhost:8500/api/applications/test-email \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\"}")

echo "   服务器响应: $RESPONSE"
echo ""

# 检查结果
if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✅ 测试邮件发送成功！"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "📬 请检查以下邮箱："
  echo "   收件箱: $TEST_EMAIL"
  echo "   (如果收件箱没有，请检查垃圾邮件文件夹)"
  echo ""
  echo "📧 邮件主题: 🧪 测试邮件 - 奖学金申请系统"
  echo ""
elif echo "$RESPONSE" | grep -q 'Invalid login' || echo "$RESPONSE" | grep -q '535'; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "❌ 邮件发送失败 - SMTP配置错误"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "⚠️ 错误原因: SMTP用户名或授权码不正确"
  echo ""
  echo "🔧 解决方法："
  echo "   1. 编辑配置文件:"
  echo "      vi /www/wwwroot/CBIT-GTIITSch/server/emailService.js"
  echo ""
  echo "   2. 修改以下配置："
  echo "      const emailConfig = {"
  echo "        host: 'smtp.qq.com',"
  echo "        port: 465,"
  echo "        secure: true,"
  echo "        auth: {"
  echo "          user: '你的QQ邮箱@qq.com',  // 替换为真实邮箱"
  echo "          pass: '你的授权码'          // 替换为QQ邮箱授权码"
  echo "        }"
  echo "      };"
  echo ""
  echo "   3. 修改所有发件人地址 (搜索 'from:'):"
  echo "      from: '\"广东以色列理工学院奖学金系统\" <你的QQ邮箱@qq.com>'"
  echo ""
  echo "   4. 重启服务器:"
  echo "      sudo pkill -f 'node server/index.js'"
  echo "      cd /www/wwwroot/CBIT-GTIITSch && nohup node server/index.js > /tmp/cbit-server.log 2>&1 &"
  echo ""
  echo "   5. 重新运行此测试脚本:"
  echo "      bash /www/wwwroot/CBIT-GTIITSch/test-email.sh"
  echo ""
  echo "📚 详细配置指南:"
  echo "   cat /www/wwwroot/CBIT-GTIITSch/EMAIL_CONFIG_GUIDE.md"
  echo ""
elif echo "$RESPONSE" | grep -q 'ECONNECTION' || echo "$RESPONSE" | grep -q 'timeout'; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "❌ 邮件发送失败 - 连接超时"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "⚠️ 可能原因:"
  echo "   1. SMTP服务器地址或端口错误"
  echo "   2. 服务器防火墙阻止SMTP端口"
  echo "   3. 网络连接问题"
  echo ""
  echo "🔧 解决方法:"
  echo "   1. 检查SMTP配置 (host和port)"
  echo "   2. 尝试更换端口 (465 → 587 或 587 → 465)"
  echo "   3. 检查防火墙设置"
  echo ""
else
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "❌ 邮件发送失败 - 未知错误"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "📋 服务器日志:"
  echo "   tail -20 /tmp/cbit-server.log | grep -i mail"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "测试完成"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
