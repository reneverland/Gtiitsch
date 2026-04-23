import React, { useState, useEffect } from 'react'
import styles from './EmailSettings.module.css'

export interface EmailConfig {
  smtpServer: string
  smtpPort: string
  senderEmail: string
  senderPassword: string
  senderName: string
}

interface EmailSettingsProps {
  onClose: () => void
}

const EmailSettings: React.FC<EmailSettingsProps> = ({ onClose }) => {
  const [config, setConfig] = useState<EmailConfig>({
    smtpServer: '',
    smtpPort: '465',
    senderEmail: '',
    senderPassword: '',
    senderName: '广东以色列理工学院'
  })

  const [showPassword, setShowPassword] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    // 从后端加载已保存的配置
    fetch('/api/applications/email-settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.config) {
          setConfig({
            smtpServer: data.config.smtp_host || '',
            smtpPort: String(data.config.smtp_port || '465'),
            senderEmail: data.config.smtp_user || '',
            senderPassword: '', // 不显示密码
            senderName: data.config.sender_name || '广东以色列理工学院'
          })
        }
      })
      .catch(err => {
        console.error('加载邮件配置失败:', err)
      })
  }, [])

  const handleChange = (field: keyof EmailConfig, value: string) => {
    setConfig({ ...config, [field]: value })
  }

  const handleSave = async () => {
    // 验证必填项
    if (!config.smtpServer || !config.smtpPort || !config.senderEmail) {
      alert('请填写所有必填项！')
      return
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(config.senderEmail)) {
      alert('邮箱格式不正确！')
      return
    }

    // 如果密码为空，提示用户
    if (!config.senderPassword) {
      const confirmSave = confirm('未填写密码，是否保留原密码继续保存？')
      if (!confirmSave) return
    }

    try {
      // 保存到后端数据库
      const response = await fetch('/api/applications/email-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          smtp_host: config.smtpServer,
          smtp_port: parseInt(config.smtpPort),
          smtp_secure: config.smtpPort === '465',
          smtp_user: config.senderEmail,
          smtp_pass: config.senderPassword,
          sender_name: config.senderName
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert('邮箱配置已保存！')
        onClose()
      } else {
        alert('保存失败：' + data.message)
      }
    } catch (error) {
      console.error('保存邮件配置错误:', error)
      alert('保存失败：' + (error as Error).message)
    }
  }

  const handleTestEmail = async () => {
    if (!testEmail) {
      alert('请输入测试邮箱地址！')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(testEmail)) {
      alert('邮箱格式不正确！')
      return
    }

    setIsTesting(true)
    
    try {
      // 调用后端API发送测试邮件
      const response = await fetch('/api/applications/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: testEmail })
      })

      const data = await response.json()
      
      setIsTesting(false)
      
      if (data.success) {
        alert(`✅ 测试邮件已发送至 ${testEmail}\n\n邮件服务配置正确！`)
      } else {
        alert(`❌ 发送失败：${data.message}\n\n请检查邮箱配置是否正确。`)
      }
    } catch (error) {
      setIsTesting(false)
      console.error('测试邮件发送错误:', error)
      alert('❌ 发送失败：' + (error as Error).message)
    }
  }

  const commonSmtpServers = [
    { name: 'QQ邮箱', server: 'smtp.qq.com', port: '465' },
    { name: '163邮箱', server: 'smtp.163.com', port: '465' },
    { name: '126邮箱', server: 'smtp.126.com', port: '465' },
    { name: 'Gmail', server: 'smtp.gmail.com', port: '465' },
    { name: '企业邮箱', server: 'smtp.exmail.qq.com', port: '465' }
  ]

  const handleQuickSelect = (server: string, port: string) => {
    setConfig({ ...config, smtpServer: server, smtpPort: port })
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>邮箱配置</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.infoBox}>
            <p>📧 配置系统发件邮箱，用于发送申请审核通知邮件。</p>
            <p className={styles.warning}>
              ⚠️ <strong>重要提示：</strong>
              <br />
              1. 邮箱密码必须使用"授权码"而非登录密码
              <br />
              2. Gmail需要在账号设置中开启"两步验证"并生成"应用专用密码"
              <br />
              3. QQ邮箱/163邮箱需在邮箱设置中开启SMTP服务并获取授权码
              <br />
              4. 配置将保存到服务器数据库中，请妥善保管
            </p>
          </div>

          <div className={styles.quickSelect}>
            <label>快速选择：</label>
            <div className={styles.quickButtons}>
              {commonSmtpServers.map((item) => (
                <button
                  key={item.name}
                  className={styles.quickBtn}
                  onClick={() => handleQuickSelect(item.server, item.port)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.required}>SMTP服务器地址</label>
            <input
              type="text"
              className={styles.input}
              value={config.smtpServer}
              onChange={(e) => handleChange('smtpServer', e.target.value)}
              placeholder="例如：smtp.qq.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.required}>SMTP端口</label>
            <input
              type="text"
              className={styles.input}
              value={config.smtpPort}
              onChange={(e) => handleChange('smtpPort', e.target.value)}
              placeholder="通常为 465 或 587"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.required}>发件邮箱地址</label>
            <input
              type="email"
              className={styles.input}
              value={config.senderEmail}
              onChange={(e) => handleChange('senderEmail', e.target.value)}
              placeholder="例如：noreply@example.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.required}>邮箱密码 / 授权码</label>
            <div className={styles.passwordInput}>
              <input
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                value={config.senderPassword}
                onChange={(e) => handleChange('senderPassword', e.target.value)}
                placeholder="邮箱授权码"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>发件人名称</label>
            <input
              type="text"
              className={styles.input}
              value={config.senderName}
              onChange={(e) => handleChange('senderName', e.target.value)}
              placeholder="显示的发件人名称"
            />
          </div>

          <div className={styles.testSection}>
            <h3>测试邮件发送</h3>
            <div className={styles.testInputGroup}>
              <input
                type="email"
                className={styles.input}
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="输入测试邮箱地址"
              />
              <button
                className={styles.testBtn}
                onClick={handleTestEmail}
                disabled={isTesting}
              >
                {isTesting ? '发送中...' : '发送测试邮件'}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>
            取消
          </button>
          <button className={styles.saveBtn} onClick={handleSave}>
            保存配置
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmailSettings

// 导出获取邮箱配置的函数
export const getEmailConfig = (): EmailConfig | null => {
  const savedConfig = localStorage.getItem('emailConfig')
  return savedConfig ? JSON.parse(savedConfig) : null
}

