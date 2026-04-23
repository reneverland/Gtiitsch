const Dysmsapi20170525 = require('@alicloud/dysmsapi20170525');
const OpenApi = require('@alicloud/openapi-client');
const { run, get } = require('./database');

let smsClient = null;

function getSmsClient() {
  if (smsClient) return smsClient;

  const config = new OpenApi.Config({
    accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
    accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
  });
  config.endpoint = 'dysmsapi.aliyuncs.com';

  smsClient = new Dysmsapi20170525.default(config);
  return smsClient;
}

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 发送短信验证码
 * @param {string} phone - 手机号
 * @param {'register'|'login'} type - 验证码类型
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function sendVerificationCode(phone, type) {
  const recent = await get(
    `SELECT * FROM sms_codes WHERE phone = ? AND type = ? AND used = 0 
     AND created_at > datetime('now', '-1 minute') ORDER BY id DESC LIMIT 1`,
    [phone, type]
  );
  if (recent) {
    return { success: false, message: '请等待60秒后再次发送' };
  }

  const todayCount = await get(
    `SELECT COUNT(*) as cnt FROM sms_codes WHERE phone = ? 
     AND created_at > datetime('now', 'start of day')`,
    [phone]
  );
  if (todayCount && todayCount.cnt >= 10) {
    return { success: false, message: '今日发送次数已达上限，请明天再试' };
  }

  const code = generateCode();
  const templateCode = type === 'register'
    ? process.env.ALIYUN_SMS_TEMPLATE_REGISTER
    : process.env.ALIYUN_SMS_TEMPLATE_LOGIN;

  try {
    const client = getSmsClient();
    const request = new Dysmsapi20170525.SendSmsRequest({
      phoneNumbers: phone,
      signName: process.env.ALIYUN_SMS_SIGN_NAME,
      templateCode: templateCode,
      templateParam: JSON.stringify({ code }),
    });

    const response = await client.sendSms(request);

    if (response.body.code !== 'OK') {
      console.error('短信发送失败:', response.body.message);
      return { success: false, message: '短信发送失败: ' + response.body.message };
    }

    await run(
      'INSERT INTO sms_codes (phone, code, type) VALUES (?, ?, ?)',
      [phone, code, type]
    );

    console.log(`✅ 验证码已发送至 ${phone} (${type})`);
    return { success: true, message: '验证码已发送' };
  } catch (error) {
    console.error('❌ 短信发送异常:', error.message);
    return { success: false, message: '短信服务异常，请稍后重试' };
  }
}

/**
 * 校验短信验证码
 * @param {string} phone - 手机号
 * @param {string} code - 验证码
 * @param {string} type - 验证码类型
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function verifyCode(phone, code, type) {
  const record = await get(
    `SELECT * FROM sms_codes WHERE phone = ? AND type = ? AND used = 0 
     AND created_at > datetime('now', '-5 minutes') ORDER BY id DESC LIMIT 1`,
    [phone, type]
  );

  if (!record) {
    return { success: false, message: '验证码不存在或已过期，请重新获取' };
  }

  if (record.code !== code) {
    return { success: false, message: '验证码错误' };
  }

  await run('UPDATE sms_codes SET used = 1 WHERE id = ?', [record.id]);
  return { success: true, message: '验证通过' };
}

/**
 * 发送审核结果通知短信
 * @param {string} phone - 手机号
 * @param {string} name - 学生姓名
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function sendStatusNotification(phone, name) {
  try {
    const client = getSmsClient();
    const request = new Dysmsapi20170525.SendSmsRequest({
      phoneNumbers: phone,
      signName: process.env.ALIYUN_SMS_SIGN_NAME,
      templateCode: process.env.ALIYUN_SMS_TEMPLATE_NOTIFY,
      templateParam: JSON.stringify({ name }),
    });

    const response = await client.sendSms(request);

    if (response.body.code !== 'OK') {
      console.error('通知短信发送失败:', response.body.message);
      return { success: false, message: response.body.message };
    }

    console.log(`✅ 审核通知短信已发送至 ${phone}`);
    return { success: true, message: '通知已发送' };
  } catch (error) {
    console.error('❌ 通知短信发送异常:', error.message);
    return { success: false, message: error.message };
  }
}

module.exports = {
  sendVerificationCode,
  verifyCode,
  sendStatusNotification,
};
