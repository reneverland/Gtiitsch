const express = require('express');
const router = express.Router();
const { run, get, all } = require('../database');
const { sendApprovalEmail, sendRejectionEmail, sendTestEmail } = require('../emailService');
const { sendStatusNotification } = require('../smsService');

// 提交/更新申请
router.post('/submit', async (req, res) => {
  try {
    const data = req.body;
    
    // 验证必填字段
    if (!data.student_id_card || !data.name || !data.scholarship_type) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必填字段' 
      });
    }

    // 检查是否已存在该学生的申请
    const existing = await get(
      'SELECT * FROM applications WHERE student_id_card = ?',
      [data.student_id_card]
    );

    const submitDate = new Date().toLocaleDateString('zh-CN');

    if (existing) {
      // 如果是批准的修改请求重新提交，标记为已使用修改机会
      const markModifyUsed = existing.modify_approved === 1;
      
      // 更新现有申请
      await run(`
        UPDATE applications SET
          name = ?,
          family_name = ?,
          given_name = ?,
          gender = ?,
          ethnicity = ?,
          birth_date = ?,
          email = ?,
          school = ?,
          subjects = ?,
          high_school_class = ?,
          class_teacher = ?,
          class_teacher_phone = ?,
          school_address = ?,
          school_province = ?,
          school_city = ?,
          parent_name = ?,
          parent_phone = ?,
          parent_wechat = ?,
          country = ?,
          province = ?,
          address = ?,
          zip_code = ?,
          scholarship_type = ?,
          exam_name = ?,
          total_score = ?,
          total_score_max = ?,
          chinese = ?,
          chinese_max = ?,
          math = ?,
          math_max = ?,
          english = ?,
          english_max = ?,
          physics = ?,
          physics_max = ?,
          chemistry = ?,
          chemistry_max = ?,
          class_rank = ?,
          total_students = ?,
          exam_name2 = ?,
          total_score2 = ?,
          total_score_max2 = ?,
          chinese2 = ?,
          chinese_max2 = ?,
          math2 = ?,
          math_max2 = ?,
          english2 = ?,
          english_max2 = ?,
          physics2 = ?,
          physics_max2 = ?,
          chemistry2 = ?,
          chemistry_max2 = ?,
          class_rank2 = ?,
          total_students2 = ?,
          competition_awards = ?,
          id_card_attachment = ?,
          score_sheet_attachment = ?,
          competition_attachments = ?,
          other_attachments = ?,
          status = 'pending',
          submit_date = ?,
          modify_used = ?,
          modify_requested = 0,
          modify_approved = 0,
          updated_at = CURRENT_TIMESTAMP
        WHERE student_id_card = ?
      `, [
        data.name,
        data.family_name,
        data.given_name,
        data.gender,
        data.ethnicity,
        data.birth_date,
        data.email,
        data.school,
        data.subjects,
        data.high_school_class,
        data.class_teacher,
        data.class_teacher_phone,
        data.school_address,
        data.school_province,
        data.school_city,
        data.parent_name,
        data.parent_phone,
        data.parent_wechat,
        data.country,
        data.province,
        data.address,
        data.zip_code,
        data.scholarship_type,
        data.exam_name,
        data.total_score,
        data.total_score_max,
        data.chinese,
        data.chinese_max,
        data.math,
        data.math_max,
        data.english,
        data.english_max,
        data.physics,
        data.physics_max,
        data.chemistry,
        data.chemistry_max,
        data.class_rank,
        data.total_students,
        data.exam_name2,
        data.total_score2,
        data.total_score_max2,
        data.chinese2,
        data.chinese_max2,
        data.math2,
        data.math_max2,
        data.english2,
        data.english_max2,
        data.physics2,
        data.physics_max2,
        data.chemistry2,
        data.chemistry_max2,
        data.class_rank2,
        data.total_students2,
        JSON.stringify(data.competition_awards || []),
        data.id_card_attachment || null,
        data.score_sheet_attachment || null,
        JSON.stringify(data.competition_attachments || []),
        JSON.stringify(data.other_attachments || []),
        submitDate,
        markModifyUsed ? 1 : (existing.modify_used || 0),
        data.student_id_card
      ]);

      res.json({ 
        success: true, 
        message: '申请已更新',
        isUpdate: true
      });
    } else {
      // 插入新申请
      const result = await run(`
        INSERT INTO applications (
          student_id_card, name, family_name, given_name, gender, ethnicity,
          birth_date, email, school, subjects, high_school_class,
          class_teacher, class_teacher_phone, school_address,
          school_province, school_city,
          parent_name, parent_phone, parent_wechat, country, province,
          address, zip_code, scholarship_type,
          exam_name, total_score, total_score_max,
          chinese, chinese_max, math, math_max, english, english_max,
          physics, physics_max, chemistry, chemistry_max,
          class_rank, total_students,
          exam_name2, total_score2, total_score_max2,
          chinese2, chinese_max2, math2, math_max2, english2, english_max2,
          physics2, physics_max2, chemistry2, chemistry_max2,
          class_rank2, total_students2,
          competition_awards, id_card_attachment, score_sheet_attachment,
          competition_attachments, other_attachments, status, submit_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
      `, [
        data.student_id_card,
        data.name,
        data.family_name,
        data.given_name,
        data.gender,
        data.ethnicity,
        data.birth_date,
        data.email,
        data.school,
        data.subjects,
        data.high_school_class,
        data.class_teacher,
        data.class_teacher_phone,
        data.school_address,
        data.school_province,
        data.school_city,
        data.parent_name,
        data.parent_phone,
        data.parent_wechat,
        data.country,
        data.province,
        data.address,
        data.zip_code,
        data.scholarship_type,
        data.exam_name,
        data.total_score,
        data.total_score_max,
        data.chinese,
        data.chinese_max,
        data.math,
        data.math_max,
        data.english,
        data.english_max,
        data.physics,
        data.physics_max,
        data.chemistry,
        data.chemistry_max,
        data.class_rank,
        data.total_students,
        data.exam_name2,
        data.total_score2,
        data.total_score_max2,
        data.chinese2,
        data.chinese_max2,
        data.math2,
        data.math_max2,
        data.english2,
        data.english_max2,
        data.physics2,
        data.physics_max2,
        data.chemistry2,
        data.chemistry_max2,
        data.class_rank2,
        data.total_students2,
        JSON.stringify(data.competition_awards || []),
        data.id_card_attachment || null,
        data.score_sheet_attachment || null,
        JSON.stringify(data.competition_attachments || []),
        JSON.stringify(data.other_attachments || []),
        submitDate
      ]);

      res.json({ 
        success: true, 
        message: '申请已提交',
        applicationId: result.id,
        isUpdate: false
      });
    }
  } catch (error) {
    console.error('提交申请错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '提交失败: ' + error.message 
    });
  }
});

// 获取学生自己的申请状态
router.get('/my-application/:idCard', async (req, res) => {
  try {
    const { idCard } = req.params;
    
    const application = await get(
      'SELECT * FROM applications WHERE student_id_card = ?',
      [idCard]
    );

    if (application) {
      // 解析 JSON 字段
      if (application.competition_awards) {
        try {
          application.competition_awards = JSON.parse(application.competition_awards);
        } catch (e) {
          application.competition_awards = [];
        }
      }
      
      // 解析附件字段
      if (application.competition_attachments) {
        try {
          application.competition_attachments = JSON.parse(application.competition_attachments);
        } catch (e) {
          application.competition_attachments = [];
        }
      }
      if (application.other_attachments) {
        try {
          application.other_attachments = JSON.parse(application.other_attachments);
        } catch (e) {
          application.other_attachments = [];
        }
      }
      
      res.json({ 
        success: true, 
        application 
      });
    } else {
      res.json({ 
        success: true, 
        application: null 
      });
    }
  } catch (error) {
    console.error('获取申请状态错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取失败: ' + error.message 
    });
  }
});

// 列表轻量字段（共用）
const LIST_FIELDS_SQL = `id, student_id_card, name, family_name, given_name, gender, ethnicity, birth_date,
              email, subjects, school, school_province, school_city, province,
              class_teacher, class_teacher_phone, school_address,
              parent_name, parent_phone, parent_wechat, address, zip_code,
              scholarship_type,
              exam_name, total_score, total_score_max,
              chinese, chinese_max, math, math_max, english, english_max,
              physics, physics_max, chemistry, chemistry_max,
              class_rank, total_students,
              exam_name2, total_score2, total_score_max2,
              chinese2, chinese_max2, math2, math_max2, english2, english_max2,
              physics2, physics_max2, chemistry2, chemistry_max2,
              class_rank2, total_students2,
              competition_awards,
              submit_date, status, notes, review_date, created_at, updated_at,
              is_archived, archived_at`;

// 获取已归档申请（管理员）—— 必须放在 /all 之前/之后均可（路径不冲突），这里放前面更直观
router.get('/all/archived', async (req, res) => {
  try {
    const applications = await all(
      `SELECT ${LIST_FIELDS_SQL}
       FROM applications
       WHERE is_archived = 1
       ORDER BY archived_at DESC, created_at DESC`
    );

    applications.forEach(app => {
      if (app.competition_awards) {
        try { app.competition_awards = JSON.parse(app.competition_awards); }
        catch (e) { app.competition_awards = []; }
      }
    });

    res.json({ success: true, applications });
  } catch (error) {
    console.error('获取已归档申请错误:', error);
    res.status(500).json({ success: false, message: '获取失败: ' + error.message });
  }
});

// 获取所有当前（未归档）申请（管理员）
router.get('/all', async (req, res) => {
  try {
    // 性能优化：列表接口不返回 4 个附件大字段（base64 图片/PDF），
    // 单条数据由 GET /:id 按需获取。这样列表响应可从 ~45MB 降到 ~50KB。
    const applications = await all(
      `SELECT ${LIST_FIELDS_SQL}
       FROM applications
       WHERE is_archived = 0 OR is_archived IS NULL
       ORDER BY created_at DESC`
    );

    applications.forEach(app => {
      if (app.competition_awards) {
        try {
          app.competition_awards = JSON.parse(app.competition_awards);
        } catch (e) {
          app.competition_awards = [];
        }
      }
    });

    res.json({ 
      success: true, 
      applications 
    });
  } catch (error) {
    console.error('获取申请列表错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取失败: ' + error.message 
    });
  }
});

// 获取单条申请完整数据（含附件 base64），管理员查看详情时按需调用
router.get('/:id(\\d+)', async (req, res) => {
  try {
    const { id } = req.params;
    const app = await get('SELECT * FROM applications WHERE id = ?', [id]);

    if (!app) {
      return res.status(404).json({
        success: false,
        message: '未找到申请记录'
      });
    }

    if (app.competition_awards) {
      try { app.competition_awards = JSON.parse(app.competition_awards); }
      catch (e) { app.competition_awards = []; }
    }
    if (app.competition_attachments) {
      try { app.competition_attachments = JSON.parse(app.competition_attachments); }
      catch (e) { app.competition_attachments = []; }
    }
    if (app.other_attachments) {
      try { app.other_attachments = JSON.parse(app.other_attachments); }
      catch (e) { app.other_attachments = []; }
    }
    if (app.id_card_attachment && typeof app.id_card_attachment === 'string') {
      try { app.id_card_attachment = JSON.parse(app.id_card_attachment); }
      catch (e) { /* 兼容历史非 JSON 字符串 */ }
    }
    if (app.score_sheet_attachment && typeof app.score_sheet_attachment === 'string') {
      try { app.score_sheet_attachment = JSON.parse(app.score_sheet_attachment); }
      catch (e) { /* 兼容历史非 JSON 字符串 */ }
    }

    res.json({
      success: true,
      application: app
    });
  } catch (error) {
    console.error('获取单条申请错误:', error);
    res.status(500).json({
      success: false,
      message: '获取失败: ' + error.message
    });
  }
});

// 更新申请状态（管理员审核）
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: '无效的状态值' 
      });
    }

    // 先获取申请信息（用于发送邮件）
    const application = await get('SELECT * FROM applications WHERE id = ?', [id]);
    
    if (!application) {
      return res.status(404).json({ 
        success: false, 
        message: '未找到申请记录' 
      });
    }

    const reviewDate = new Date().toLocaleDateString('zh-CN');

    await run(
      `UPDATE applications 
       SET status = ?, notes = ?, review_date = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [status, notes, reviewDate, id]
    );

    // 发送邮件通知（异步，不阻塞响应）
    if (application.email && (status === 'approved' || status === 'rejected')) {
      const emailPromise = status === 'approved' 
        ? sendApprovalEmail(application.email, application.name, application.scholarship_type)
        : sendRejectionEmail(application.email, application.name, application.scholarship_type, notes);
      
      emailPromise
        .then(result => {
          if (result.success) {
            console.log(`✅ 邮件已发送至 ${application.email}`);
          } else {
            console.error(`❌ 邮件发送失败: ${result.error}`);
          }
        })
        .catch(err => {
          console.error('❌ 邮件发送异常:', err);
        });
    }

    // 发送短信通知（异步，不阻塞响应）
    if (status === 'approved' || status === 'rejected') {
      const student = await get(
        'SELECT phone, full_name FROM students WHERE id_card = ?',
        [application.student_id_card]
      );
      if (student && student.phone) {
        sendStatusNotification(student.phone, student.full_name)
          .then(result => {
            if (result.success) {
              console.log(`✅ 短信通知已发送至 ${student.phone}`);
            } else {
              console.error(`❌ 短信通知发送失败: ${result.message}`);
            }
          })
          .catch(err => {
            console.error('❌ 短信通知发送异常:', err);
          });
      }
    }

    res.json({ 
      success: true, 
      message: '状态已更新，通知已发送' 
    });
  } catch (error) {
    console.error('更新状态错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '更新失败: ' + error.message 
    });
  }
});

// 修改奖学金类型（管理员）—— 主要场景：学科特长奖 → 转为创新潜质奖
router.patch('/:id(\\d+)/scholarship-type', async (req, res) => {
  try {
    const { id } = req.params;
    const { scholarship_type } = req.body || {};

    if (!scholarship_type || !['subject', 'innovation'].includes(scholarship_type)) {
      return res.status(400).json({ success: false, message: '无效的奖学金类型，必须是 subject 或 innovation' });
    }

    await run(
      'UPDATE applications SET scholarship_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [scholarship_type, id]
    );

    res.json({ success: true, message: '奖学金类型已更新', scholarship_type });
  } catch (error) {
    console.error('修改奖学金类型错误:', error);
    res.status(500).json({ success: false, message: '修改失败: ' + error.message });
  }
});

// 物理删除申请（管理员，二次确认后真删）—— 必须放在 DELETE /:id 之前，避免被截
router.delete('/:id(\\d+)/force', async (req, res) => {
  try {
    const { id } = req.params;
    await run('DELETE FROM applications WHERE id = ?', [id]);
    res.json({ success: true, message: '申请已永久删除' });
  } catch (error) {
    console.error('永久删除申请错误:', error);
    res.status(500).json({ success: false, message: '永久删除失败: ' + error.message });
  }
});

// 从归档恢复（管理员）
router.post('/:id(\\d+)/restore', async (req, res) => {
  try {
    const { id } = req.params;
    await run(
      'UPDATE applications SET is_archived = 0, archived_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    res.json({ success: true, message: '申请已恢复' });
  } catch (error) {
    console.error('恢复申请错误:', error);
    res.status(500).json({ success: false, message: '恢复失败: ' + error.message });
  }
});

// 删除申请（管理员）—— 现在是软归档：写 is_archived = 1 + archived_at，可恢复或永久删除
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const archivedAt = new Date().toISOString();

    await run(
      'UPDATE applications SET is_archived = 1, archived_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [archivedAt, id]
    );

    res.json({ 
      success: true, 
      message: '申请已归档' 
    });
  } catch (error) {
    console.error('归档申请错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '归档失败: ' + error.message 
    });
  }
});

// 提交修改请求（学生）- 直接解锁，不需要审核
router.post('/request-modify', async (req, res) => {
  try {
    const { idCard, reason, attachments } = req.body;
    
    if (!idCard || !reason || reason.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必填字段' 
      });
    }

    // 检查申请是否存在
    const application = await get(
      'SELECT * FROM applications WHERE student_id_card = ?',
      [idCard]
    );

    if (!application) {
      return res.status(404).json({ 
        success: false, 
        message: '未找到申请记录' 
      });
    }

    // 检查是否已经使用过修改机会
    if (application.modify_used === 1) {
      return res.status(400).json({ 
        success: false, 
        message: '您已使用过修改机会，不能再次申请' 
      });
    }

    const requestDate = new Date().toLocaleDateString('zh-CN');

    // 直接解锁申请，允许学生修改
    await run(`
      UPDATE applications SET
        status = 'not_submitted',
        modify_requested = 1,
        modify_reason = ?,
        modify_attachments = ?,
        modify_request_date = ?,
        modify_approved = 1,
        modify_used = 1
      WHERE student_id_card = ?
    `, [
      reason,
      JSON.stringify(attachments || []),
      requestDate,
      idCard
    ]);

    // 同时写入审计日志（modify_history）：永久保留，便于管理员追溯学生历次修改
    try {
      await run(`
        INSERT INTO modify_history
          (application_id, student_id_card, name, scholarship_type, reason, attachments, request_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        application.id,
        idCard,
        application.name || '',
        application.scholarship_type || '',
        reason,
        JSON.stringify(attachments || []),
        requestDate
      ]);
    } catch (logErr) {
      console.error('写入 modify_history 失败（不影响主流程）:', logErr);
    }

    res.json({ 
      success: true, 
      message: '申请已解锁，您可以重新编辑并提交' 
    });
  } catch (error) {
    console.error('提交修改请求错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '提交失败: ' + error.message 
    });
  }
});

// 获取修改请求状态（学生）
router.get('/modify-status/:idCard', async (req, res) => {
  try {
    const { idCard } = req.params;

    const application = await get(
      `SELECT 
        modify_requested, 
        modify_reason, 
        modify_request_date, 
        modify_approved, 
        modify_approve_date, 
        modify_used 
      FROM applications 
      WHERE student_id_card = ?`,
      [idCard]
    );

    if (!application) {
      return res.status(404).json({ 
        success: false, 
        message: '未找到申请记录' 
      });
    }

    res.json({ 
      success: true, 
      data: {
        requested: application.modify_requested === 1,
        reason: application.modify_reason,
        requestDate: application.modify_request_date,
        approved: application.modify_approved === 1,
        approveDate: application.modify_approve_date,
        used: application.modify_used === 1
      }
    });
  } catch (error) {
    console.error('获取修改状态错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取失败: ' + error.message 
    });
  }
});

// 审核修改请求（管理员）
router.post('/approve-modify/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body; // true or false

    const approveDate = new Date().toLocaleDateString('zh-CN');

    if (approved) {
      // 批准修改：解锁申请，允许学生重新编辑
      await run(`
        UPDATE applications SET
          modify_approved = 1,
          modify_approve_date = ?,
          status = 'not_submitted'
        WHERE id = ?
      `, [approveDate, id]);

      res.json({ 
        success: true, 
        message: '已批准修改请求，学生可以重新编辑申请' 
      });
    } else {
      // 拒绝修改：重置修改请求状态
      await run(`
        UPDATE applications SET
          modify_requested = 0,
          modify_approved = 0,
          modify_reason = NULL,
          modify_attachments = NULL,
          modify_request_date = NULL
        WHERE id = ?
      `, [id]);

      res.json({ 
        success: true, 
        message: '已拒绝修改请求' 
      });
    }
  } catch (error) {
    console.error('审核修改请求错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '审核失败: ' + error.message 
    });
  }
});

// 获取修改请求审计历史（管理员）—— 来源 modify_history，永久保留
router.get('/pending-modifications', async (req, res) => {
  try {
    const rows = await all(
      `SELECT
        id,
        application_id,
        student_id_card,
        name,
        scholarship_type,
        reason,
        attachments,
        request_date,
        created_at
      FROM modify_history
      ORDER BY created_at DESC
      LIMIT 200`
    );

    const result = rows.map(row => {
      let attachments = [];
      if (row.attachments) {
        try {
          attachments = JSON.parse(row.attachments);
        } catch (e) {
          attachments = [];
        }
      }
      return {
        history_id: row.id,
        application_id: row.application_id,
        student_id_card: row.student_id_card,
        name: row.name,
        scholarship_type: row.scholarship_type,
        reason: row.reason,
        attachments,
        request_date: row.request_date,
        created_at: row.created_at
      };
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取修改请求列表错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取失败: ' + error.message 
    });
  }
});

// 测试邮件发送
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: '请提供收件人邮箱' 
      });
    }

    const result = await sendTestEmail(email);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: `测试邮件已发送至 ${email}`,
        messageId: result.messageId
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: '邮件发送失败: ' + result.error 
      });
    }
  } catch (error) {
    console.error('测试邮件发送错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '发送失败: ' + error.message 
    });
  }
});

// 保存邮件配置（管理员）
router.post('/email-settings', async (req, res) => {
  try {
    const { smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass, sender_name } = req.body;
    
    if (!smtp_host || !smtp_port || !smtp_user || !smtp_pass) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必填字段' 
      });
    }

    // 检查是否已存在配置
    const existing = await get('SELECT * FROM email_settings LIMIT 1');
    
    if (existing) {
      // 更新现有配置
      await run(`
        UPDATE email_settings SET
          smtp_host = ?,
          smtp_port = ?,
          smtp_secure = ?,
          smtp_user = ?,
          smtp_pass = ?,
          sender_name = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [smtp_host, smtp_port, smtp_secure ? 1 : 0, smtp_user, smtp_pass, sender_name || '广东以色列理工学院', existing.id]);
    } else {
      // 插入新配置
      await run(`
        INSERT INTO email_settings (smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass, sender_name)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [smtp_host, smtp_port, smtp_secure ? 1 : 0, smtp_user, smtp_pass, sender_name || '广东以色列理工学院']);
    }

    res.json({ 
      success: true, 
      message: '邮件配置已保存' 
    });
  } catch (error) {
    console.error('保存邮件配置错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '保存失败: ' + error.message 
    });
  }
});

// 获取邮件配置（管理员）
router.get('/email-settings', async (req, res) => {
  try {
    const config = await get('SELECT * FROM email_settings ORDER BY id DESC LIMIT 1');
    
    if (config) {
      // 不返回密码明文，只返回是否已配置
      res.json({ 
        success: true, 
        config: {
          smtp_host: config.smtp_host,
          smtp_port: config.smtp_port,
          smtp_secure: config.smtp_secure === 1,
          smtp_user: config.smtp_user,
          smtp_pass: '********', // 隐藏密码
          sender_name: config.sender_name,
          has_password: !!config.smtp_pass
        }
      });
    } else {
      res.json({ 
        success: true, 
        config: null 
      });
    }
  } catch (error) {
    console.error('获取邮件配置错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取失败: ' + error.message 
    });
  }
});

module.exports = router;
