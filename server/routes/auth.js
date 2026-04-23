const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { run, get } = require('../database');
const { sendVerificationCode, verifyCode } = require('../smsService');

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

// POST /api/auth/send-code  发送短信验证码
router.post('/send-code', async (req, res) => {
  try {
    const { phone, type } = req.body;

    if (!phone || !type) {
      return res.status(400).json({ success: false, message: '缺少手机号或类型参数' });
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ success: false, message: '手机号格式不正确' });
    }

    if (!['register', 'login'].includes(type)) {
      return res.status(400).json({ success: false, message: '无效的验证码类型' });
    }

    if (type === 'register') {
      const existing = await get('SELECT id FROM students WHERE phone = ?', [phone]);
      if (existing) {
        return res.status(400).json({ success: false, message: '该手机号已被注册' });
      }
    }

    if (type === 'login') {
      const existing = await get('SELECT id FROM students WHERE phone = ?', [phone]);
      if (!existing) {
        return res.status(400).json({ success: false, message: '该手机号未注册，请先注册' });
      }
    }

    const result = await sendVerificationCode(phone, type);
    res.json(result);
  } catch (error) {
    console.error('发送验证码异常:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// POST /api/auth/register  注册
router.post('/register', async (req, res) => {
  try {
    const { fullName, idNumber, phone, password, code } = req.body;

    if (!fullName || !idNumber || !phone || !password || !code) {
      return res.status(400).json({ success: false, message: '请填写所有必填项' });
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ success: false, message: '手机号格式不正确' });
    }

    if (idNumber.length !== 18) {
      return res.status(400).json({ success: false, message: '身份证号应为18位' });
    }

    const codeResult = await verifyCode(phone, code, 'register');
    if (!codeResult.success) {
      return res.status(400).json(codeResult);
    }

    const existingIdCard = await get('SELECT id FROM students WHERE id_card = ?', [idNumber]);
    if (existingIdCard) {
      return res.status(400).json({ success: false, message: '该身份证号已注册' });
    }

    const existingPhone = await get('SELECT id FROM students WHERE phone = ?', [phone]);
    if (existingPhone) {
      return res.status(400).json({ success: false, message: '该手机号已被注册' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = hashPassword(password, salt);

    await run(
      'INSERT INTO students (id_card, full_name, phone, password, salt) VALUES (?, ?, ?, ?, ?)',
      [idNumber, fullName, phone, hashedPassword, salt]
    );

    console.log(`✅ 新学生注册: ${fullName} (${idNumber})`);
    res.json({
      success: true,
      message: '注册成功',
      data: { idCard: idNumber, fullName, phone }
    });
  } catch (error) {
    console.error('注册异常:', error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ success: false, message: '身份证号或手机号已注册' });
    }
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// POST /api/auth/login  密码登录
router.post('/login', async (req, res) => {
  try {
    const { idCard, password } = req.body;

    if (!idCard || !password) {
      return res.status(400).json({ success: false, message: '请输入身份证号和密码' });
    }

    const student = await get('SELECT * FROM students WHERE id_card = ?', [idCard]);
    if (!student) {
      return res.status(400).json({ success: false, message: '账号不存在，请先注册' });
    }

    const hashedPassword = hashPassword(password, student.salt);
    if (hashedPassword !== student.password) {
      return res.status(400).json({ success: false, message: '密码错误' });
    }

    console.log(`✅ 学生登录: ${student.full_name} (${idCard})`);
    res.json({
      success: true,
      message: '登录成功',
      data: { idCard: student.id_card, fullName: student.full_name, phone: student.phone }
    });
  } catch (error) {
    console.error('登录异常:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// POST /api/auth/login-sms  短信验证码登录
router.post('/login-sms', async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ success: false, message: '请输入手机号和验证码' });
    }

    const codeResult = await verifyCode(phone, code, 'login');
    if (!codeResult.success) {
      return res.status(400).json(codeResult);
    }

    const student = await get('SELECT * FROM students WHERE phone = ?', [phone]);
    if (!student) {
      return res.status(400).json({ success: false, message: '该手机号未注册' });
    }

    console.log(`✅ 学生短信登录: ${student.full_name} (${student.id_card})`);
    res.json({
      success: true,
      message: '登录成功',
      data: { idCard: student.id_card, fullName: student.full_name, phone: student.phone }
    });
  } catch (error) {
    console.error('短信登录异常:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// GET /api/auth/profile?idCard=xxx  获取学生信息
router.get('/profile', async (req, res) => {
  try {
    const { idCard } = req.query;
    if (!idCard) {
      return res.status(400).json({ success: false, message: '缺少身份证号' });
    }

    const student = await get(
      'SELECT id_card, full_name, phone, created_at FROM students WHERE id_card = ?',
      [idCard]
    );
    if (!student) {
      return res.status(404).json({ success: false, message: '未找到学生信息' });
    }

    res.json({
      success: true,
      data: {
        idCard: student.id_card,
        fullName: student.full_name,
        phone: student.phone,
        createdAt: student.created_at
      }
    });
  } catch (error) {
    console.error('获取信息异常:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// POST /api/auth/change-phone  更换手机号
router.post('/change-phone', async (req, res) => {
  try {
    const { idCard, newPhone, code } = req.body;

    if (!idCard || !newPhone || !code) {
      return res.status(400).json({ success: false, message: '缺少必要参数' });
    }

    if (!/^1[3-9]\d{9}$/.test(newPhone)) {
      return res.status(400).json({ success: false, message: '新手机号格式不正确' });
    }

    const existingPhone = await get('SELECT id FROM students WHERE phone = ? AND id_card != ?', [newPhone, idCard]);
    if (existingPhone) {
      return res.status(400).json({ success: false, message: '该手机号已被其他账号绑定' });
    }

    const codeResult = await verifyCode(newPhone, code, 'register');
    if (!codeResult.success) {
      return res.status(400).json(codeResult);
    }

    await run('UPDATE students SET phone = ? WHERE id_card = ?', [newPhone, idCard]);

    console.log(`✅ 学生更换手机号: ${idCard} -> ${newPhone}`);
    res.json({ success: true, message: '手机号更换成功' });
  } catch (error) {
    console.error('更换手机号异常:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router;
