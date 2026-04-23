import React, { useState } from 'react'
import styles from './EmailModal.module.css'

interface Props {
  recipient: {
    name: string
    email: string
  }
  onClose: () => void
  onSend: (data: EmailData) => void
}

export interface EmailData {
  to: string
  subject: string
  body: string
}

const emailTemplates = {
  approved: {
    subject: '【广东以色列理工学院】奖学金申请审核通过通知',
    body: `尊敬的{name}同学：

您好！

恭喜您！经过我校奖学金评审委员会的认真评审，您的三博文奖学金申请已获通过。

请您在收到本邮件后的7个工作日内，按照以下要求完成后续手续：
1. 登录系统确认接受奖学金
2. 填写并提交相关确认表格
3. 准备入学所需材料

如有任何疑问，请联系我们：
电话：0754-88077077
邮箱：sci-scholarship@gtiit.edu.cn

再次祝贺您！期待您加入广东以色列理工学院！

广东以色列理工学院
招生办公室
{date}`
  },
  rejected: {
    subject: '【广东以色列理工学院】奖学金申请审核结果通知',
    body: `尊敬的{name}同学：

您好！

感谢您申请广东以色列理工学院三博文奖学金。

经过我校奖学金评审委员会的认真评审，很遗憾地通知您，您的申请未能通过本次评审。

我们鼓励您继续关注我校的其他奖学金项目和招生信息。如有任何疑问，欢迎随时与我们联系。

联系方式：
电话：0754-88077077
邮箱：sci-scholarship@gtiit.edu.cn

祝您学业进步，前程似锦！

广东以色列理工学院
招生办公室
{date}`
  },
  supplement: {
    subject: '【广东以色列理工学院】奖学金申请材料补充通知',
    body: `尊敬的{name}同学：

您好！

经审核，您的奖学金申请材料需要补充以下内容：

【请在此处说明需要补充的材料】

请您在收到本邮件后的3个工作日内补充完整材料，逾期将影响审核进度。

如有任何疑问，请联系我们：
电话：0754-88077077
邮箱：sci-scholarship@gtiit.edu.cn

感谢您的配合！

广东以色列理工学院
招生办公室
{date}`
  }
}

const EmailModal: React.FC<Props> = ({ recipient, onClose, onSend }) => {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isSending, setIsSending] = useState(false)

  const applyTemplate = (templateKey: keyof typeof emailTemplates) => {
    const template = emailTemplates[templateKey]
    const today = new Date().toLocaleDateString('zh-CN')
    
    setSubject(template.subject)
    setBody(template.body.replace('{name}', recipient.name).replace('{date}', today))
  }

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) {
      alert('请填写邮件主题和正文')
      return
    }

    setIsSending(true)
    onSend({
      to: recipient.email,
      subject,
      body
    })
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>发送邮件</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.recipientInfo}>
            <strong>收件人：</strong>{recipient.name} ({recipient.email})
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>快速模板</label>
            <div className={styles.templateButtons}>
              <button
                className={styles.templateBtn}
                onClick={() => applyTemplate('approved')}
              >
                审核通过通知
              </button>
              <button
                className={styles.templateBtn}
                onClick={() => applyTemplate('rejected')}
              >
                审核未通过通知
              </button>
              <button
                className={styles.templateBtn}
                onClick={() => applyTemplate('supplement')}
              >
                材料补充通知
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              邮件主题<span className="required">*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="请输入邮件主题"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              邮件正文<span className="required">*</span>
            </label>
            <textarea
              className={styles.textarea}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="请输入邮件内容..."
            />
            <div className={styles.note}>
              💡 提示：实际邮件发送需要配置后端SMTP服务器。当前为演示功能。
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnSecondary} onClick={onClose}>
            取消
          </button>
          <button
            className={styles.btnPrimary}
            onClick={handleSend}
            disabled={isSending}
          >
            {isSending ? '发送中...' : '发送邮件'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmailModal


