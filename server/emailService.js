const nodemailer = require('nodemailer');
const { get } = require('./database');

/**
 * 获取邮件配置并创建传输对象
 */
async function getEmailTransporter() {
  try {
    // 从数据库读取邮件配置
    const config = await get('SELECT * FROM email_settings ORDER BY id DESC LIMIT 1');
    
    if (!config) {
      throw new Error('邮件配置未设置，请在管理后台配置SMTP服务器信息');
    }

    // 创建邮件传输对象
    const transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: config.smtp_port,
      secure: config.smtp_secure === 1, // true for 465, false for other ports
      auth: {
        user: config.smtp_user,
        pass: config.smtp_pass
      }
    });

    return { transporter, config };
  } catch (error) {
    console.error('❌ 获取邮件配置失败:', error.message);
    throw error;
  }
}

/**
 * 发送申请审核通过邮件
 * @param {string} to - 收件人邮箱
 * @param {string} studentName - 学生姓名
 * @param {string} scholarshipType - 奖学金类型
 */
async function sendApprovalEmail(to, studentName, scholarshipType) {
  const { transporter, config } = await getEmailTransporter();
  const scholarshipName = scholarshipType === 'subject' ? '学科特长奖学金' : '创新潜质奖学金';
  const senderName = config.sender_name || '广东以色列理工学院';
  
  const mailOptions = {
    from: `"${senderName}奖学金系统" <${config.smtp_user}>`, // 发件人
    to: to, // 收件人
    subject: '🎉 恭喜！您的奖学金申请已通过审核', // 邮件主题
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Microsoft YaHei', 'SimSun', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #0132b2 0%, #0a5ce6 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .info-box {
      background: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .button {
      display: inline-block;
      background: #0132b2;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      margin-top: 20px;
      font-weight: bold;
    }
    .footer {
      background: #f9fafb;
      padding: 20px;
      text-align: center;
      border-radius: 0 0 10px 10px;
      border: 1px solid #e5e7eb;
      border-top: none;
      font-size: 14px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 申请审核通过</h1>
  </div>
  
  <div class="content">
    <p>尊敬的 <strong>${studentName}</strong> 同学：</p>
    
    <p>恭喜您！您申请的 <strong>${scholarshipName}</strong> 已通过审核！</p>
    
    <div class="info-box">
      <p style="margin: 0;"><strong>📌 重要提示：</strong></p>
      <ul style="margin-top: 10px;">
        <li>请登录系统查看详细审核结果</li>
        <li>如有疑问，请联系招生办公室</li>
        <li>请关注后续通知邮件</li>
      </ul>
    </div>
    
    <p>感谢您对广东以色列理工学院的关注和支持！</p>
    
    <a href="http://llmhi.com:8500" class="button">登录查看详情</a>
  </div>
  
  <div class="footer">
    <p>此邮件由系统自动发送，请勿直接回复。</p>
    <p>广东以色列理工学院招生办公室</p>
    <p>Guangdong Technion - Israel Institute of Technology</p>
  </div>
</body>
</html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ 审核通过邮件已发送:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ 发送邮件失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 发送申请审核拒绝邮件
 * @param {string} to - 收件人邮箱
 * @param {string} studentName - 学生姓名
 * @param {string} scholarshipType - 奖学金类型
 * @param {string} reason - 拒绝原因
 */
async function sendRejectionEmail(to, studentName, scholarshipType, reason) {
  const { transporter, config } = await getEmailTransporter();
  const scholarshipName = scholarshipType === 'subject' ? '学科特长奖学金' : '创新潜质奖学金';
  const senderName = config.sender_name || '广东以色列理工学院';
  
  const mailOptions = {
    from: `"${senderName}奖学金系统" <${config.smtp_user}>`,
    to: to,
    subject: '关于您的奖学金申请审核结果',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Microsoft YaHei', 'SimSun', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .info-box {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .button {
      display: inline-block;
      background: #0132b2;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      margin-top: 20px;
      font-weight: bold;
    }
    .footer {
      background: #f9fafb;
      padding: 20px;
      text-align: center;
      border-radius: 0 0 10px 10px;
      border: 1px solid #e5e7eb;
      border-top: none;
      font-size: 14px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>审核结果通知</h1>
  </div>
  
  <div class="content">
    <p>尊敬的 <strong>${studentName}</strong> 同学：</p>
    
    <p>感谢您申请我校的 <strong>${scholarshipName}</strong>。经过认真审核，很遗憾地通知您，您的申请未能通过本次审核。</p>
    
    ${reason ? `
    <div class="info-box">
      <p style="margin: 0;"><strong>📌 审核意见：</strong></p>
      <p style="margin-top: 10px;">${reason}</p>
    </div>
    ` : ''}
    
    <p>我们鼓励您：</p>
    <ul>
      <li>继续努力学习，提升自己的综合素质</li>
      <li>关注我校其他奖学金项目</li>
      <li>如有疑问，欢迎联系招生办公室咨询</li>
    </ul>
    
    <p>再次感谢您对广东以色列理工学院的关注！</p>
    
    <a href="http://llmhi.com:8500" class="button">登录查看详情</a>
  </div>
  
  <div class="footer">
    <p>此邮件由系统自动发送，请勿直接回复。</p>
    <p>广东以色列理工学院招生办公室</p>
    <p>Guangdong Technion - Israel Institute of Technology</p>
  </div>
</body>
</html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ 审核拒绝邮件已发送:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ 发送邮件失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 测试邮件发送
 * @param {string} to - 收件人邮箱
 */
async function sendTestEmail(to) {
  const { transporter, config } = await getEmailTransporter();
  const senderName = config.sender_name || '广东以色列理工学院';
  
  const mailOptions = {
    from: `"${senderName}奖学金系统" <${config.smtp_user}>`,
    to: to,
    subject: '🧪 测试邮件 - 奖学金申请系统',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Microsoft YaHei', 'SimSun', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .footer {
      background: #f9fafb;
      padding: 20px;
      text-align: center;
      border-radius: 0 0 10px 10px;
      border: 1px solid #e5e7eb;
      border-top: none;
      font-size: 14px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🧪 测试邮件</h1>
  </div>
  
  <div class="content">
    <h2>邮件系统测试成功！</h2>
    
    <p>这是一封来自<strong>广东以色列理工学院奖学金申请系统</strong>的测试邮件。</p>
    
    <p><strong>测试时间：</strong>${new Date().toLocaleString('zh-CN')}</p>
    
    <p>如果您收到此邮件，说明邮件服务已配置成功，可以正常发送邮件通知。</p>
    
    <p><strong>✅ 邮件功能正常工作！</strong></p>
  </div>
  
  <div class="footer">
    <p>此邮件由系统自动发送，请勿直接回复。</p>
    <p>广东以色列理工学院招生办公室</p>
  </div>
</body>
</html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ 测试邮件已发送:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ 发送测试邮件失败:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendApprovalEmail,
  sendRejectionEmail,
  sendTestEmail
};
