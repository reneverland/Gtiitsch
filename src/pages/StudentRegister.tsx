import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './StudentRegister.module.css'

const StudentRegister: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    password: '',
    confirmPassword: '',
    phone: '',
    verificationCode: ''
  })

  const [validation, setValidation] = useState({
    fullName: '',
    idNumber: '',
    password: '',
    confirmPassword: '',
    phone: '',
    verificationCode: ''
  })

  const [countdown, setCountdown] = useState(0)
  const [isSending, setIsSending] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)

  const validateName = (name: string) => {
    const chineseRegex = /^[\u4e00-\u9fa5]+$/
    if (!name) {
      return { valid: false, message: '' }
    }
    if (!chineseRegex.test(name)) {
      return { valid: false, message: '请输入中文姓名' }
    }
    return { valid: true, message: '✓ 姓名输入正确' }
  }

  const validateIdNumber = (id: string) => {
    if (!id) {
      return { valid: false, message: '' }
    }
    if (id.length !== 18) {
      return { valid: false, message: '身份证号应为18位' }
    }
    return { valid: true, message: '✓ 身份证号为唯一识别码，请确认为本人身份证号' }
  }

  const validatePassword = (pwd: string) => {
    if (!pwd) {
      return { valid: false, message: '' }
    }
    if (pwd.length < 6) {
      return { valid: false, message: '密码至少6位' }
    }
    const hasLetter = /[a-zA-Z]/.test(pwd)
    const hasNumber = /[0-9]/.test(pwd)
    if (!hasLetter || !hasNumber) {
      return { valid: false, message: '密码需包含字母和数字' }
    }
    return { valid: true, message: '✓ 密码输入正确' }
  }

  const validateConfirmPassword = (confirmPwd: string) => {
    if (!confirmPwd) {
      return { valid: false, message: '' }
    }
    if (confirmPwd !== formData.password) {
      return { valid: false, message: '两次密码不一致' }
    }
    return { valid: true, message: '✓ 密码输入正确' }
  }

  const validatePhone = (phone: string) => {
    if (!phone) {
      return { valid: false, message: '' }
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return { valid: false, message: '请输入正确的11位手机号' }
    }
    return { valid: true, message: '✓ 手机号输入正确' }
  }

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })

    let validationResult = { valid: false, message: '' }
    switch (field) {
      case 'fullName':
        validationResult = validateName(value)
        break
      case 'idNumber':
        validationResult = validateIdNumber(value)
        break
      case 'password':
        validationResult = validatePassword(value)
        if (formData.confirmPassword) {
          const confirmValidation = validateConfirmPassword(formData.confirmPassword)
          setValidation(prev => ({ ...prev, confirmPassword: confirmValidation.message }))
        }
        break
      case 'confirmPassword':
        validationResult = validateConfirmPassword(value)
        break
      case 'phone':
        validationResult = validatePhone(value)
        break
    }

    setValidation({ ...validation, [field]: validationResult.message })
  }

  const handleSendVerificationCode = async () => {
    const phoneValidation = validatePhone(formData.phone)
    if (!phoneValidation.valid) {
      alert('请先输入正确的手机号')
      return
    }

    setIsSending(true)
    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, type: 'register' })
      })
      const result = await response.json()

      if (result.success) {
        alert('验证码已发送至 ' + formData.phone)
        setCountdown(60)
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        alert(result.message || '验证码发送失败')
      }
    } catch (error) {
      alert('网络错误，请稍后重试')
    } finally {
      setIsSending(false)
    }
  }

  const handleRegister = async () => {
    const nameValidation = validateName(formData.fullName)
    const idValidation = validateIdNumber(formData.idNumber)
    const pwdValidation = validatePassword(formData.password)
    const confirmPwdValidation = validateConfirmPassword(formData.confirmPassword)
    const phoneValidation = validatePhone(formData.phone)

    if (!nameValidation.valid || !idValidation.valid || !pwdValidation.valid || 
        !confirmPwdValidation.valid || !phoneValidation.valid) {
      alert('请检查并正确填写所有必填项')
      return
    }

    if (!formData.verificationCode) {
      alert('请输入短信验证码')
      return
    }

    setIsRegistering(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          idNumber: formData.idNumber,
          phone: formData.phone,
          password: formData.password,
          code: formData.verificationCode
        })
      })
      const result = await response.json()

      if (result.success) {
        localStorage.setItem('studentLoggedIn', 'true')
        localStorage.setItem('studentIdCard', result.data.idCard)
        alert('注册成功！即将跳转到申请系统')
        navigate('/student')
      } else {
        alert(result.message || '注册失败')
      }
    } catch (error) {
      alert('网络错误，请稍后重试')
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className={styles.registerContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>注册 Register</h1>
        <p className={styles.subtitle}>广东以色列理工学院奖学金申请系统</p>
      </div>

      <div className={styles.registerCard}>
        <table className={styles.formTable}>
          <tbody>
            <tr className={styles.formRow}>
              <td className={styles.labelCell}>
                <div>学生姓名</div>
                <small>Full Name</small>
              </td>
              <td className={styles.inputCell}>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="请输入学生本人中文姓名"
                />
                {validation.fullName && (
                  <span className={`${styles.validation} ${
                    validation.fullName.includes('✓') ? styles.success : styles.error
                  }`}>
                    {validation.fullName}
                  </span>
                )}
              </td>
            </tr>

            <tr className={styles.formRow}>
              <td className={styles.labelCell}>
                <div>学生本人身份证号</div>
                <small>ID No.</small>
              </td>
              <td className={styles.inputCell}>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.idNumber}
                  onChange={(e) => handleChange('idNumber', e.target.value)}
                  placeholder="请输入18位身份证号"
                  maxLength={18}
                />
                {validation.idNumber && (
                  <span className={`${styles.validation} ${
                    validation.idNumber.includes('✓') ? styles.success : styles.error
                  }`}>
                    {validation.idNumber}
                  </span>
                )}
              </td>
            </tr>

            <tr className={styles.formRow}>
              <td className={styles.labelCell}>
                <div>密码</div>
                <small>Password</small>
              </td>
              <td className={styles.inputCell}>
                <input
                  type="password"
                  className={styles.input}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="6位以上字母和数字组合"
                />
                {validation.password && (
                  <span className={`${styles.validation} ${
                    validation.password.includes('✓') ? styles.success : styles.error
                  }`}>
                    {validation.password}
                  </span>
                )}
              </td>
            </tr>

            <tr className={styles.formRow}>
              <td className={styles.labelCell}>
                <div>确认密码</div>
                <small>Confirm Password</small>
              </td>
              <td className={styles.inputCell}>
                <input
                  type="password"
                  className={styles.input}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="请再次输入密码"
                />
                {validation.confirmPassword && (
                  <span className={`${styles.validation} ${
                    validation.confirmPassword.includes('✓') ? styles.success : styles.error
                  }`}>
                    {validation.confirmPassword}
                  </span>
                )}
              </td>
            </tr>

            <tr className={styles.formRow}>
              <td className={styles.labelCell}>
                <div>手机号</div>
                <small>Phone Number</small>
              </td>
              <td className={styles.inputCell}>
                <input
                  type="tel"
                  className={styles.input}
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="请输入11位手机号"
                  maxLength={11}
                />
                {validation.phone && (
                  <span className={`${styles.validation} ${
                    validation.phone.includes('✓') ? styles.success : styles.error
                  }`}>
                    {validation.phone}
                  </span>
                )}
                <button
                  className={styles.verifyButton}
                  onClick={handleSendVerificationCode}
                  disabled={countdown > 0 || !validatePhone(formData.phone).valid || isSending}
                >
                  {isSending ? '发送中...' : countdown > 0 ? `${countdown}秒后重试` : '点击获取短信验证码'}
                </button>
              </td>
            </tr>

            <tr className={styles.formRow}>
              <td className={styles.labelCell}>
                <div>短信验证码</div>
                <small>Verification Code</small>
              </td>
              <td className={styles.inputCell}>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.verificationCode}
                  onChange={(e) => handleChange('verificationCode', e.target.value)}
                  placeholder="请输入短信验证码"
                  maxLength={6}
                />
                {!formData.verificationCode && (
                  <span className={`${styles.validation} ${styles.warning}`}>
                    ⚠ 请输入短信验证码
                  </span>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        <div className={styles.notice}>
          <div className={styles.noticeTitle}>注意：</div>
          <ul className={styles.noticeList}>
            <li>1.请确认以上信息为<strong>学生本人</strong>的真实证件信息和密码。证件号将作为唯一报名证号，无法更改，确认无误后再提交。</li>
            <li>2.请填写常用的手机号，所有的系统短信通知会发送到此号码。此号码不对外公开，当需要联系您时，也会使用此手机号或获取其他您预留的联系方式。</li>
          </ul>
        </div>

        <div className={styles.actions}>
          <button 
            className={styles.btnPrimary} 
            onClick={handleRegister}
            disabled={isRegistering}
          >
            {isRegistering ? '注册中...' : '注册 Register'}
          </button>
          <button className={styles.btnSecondary} onClick={() => navigate('/')}>
            返回 Return
          </button>
        </div>
      </div>

      <div className={styles.loginLink}>
        已有账号？<a href="/">返回首页登录</a>
      </div>
    </div>
  )
}

export default StudentRegister
