import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './StudentLoginModal.module.css'

interface StudentLoginModalProps {
  onClose: () => void
  onLoginSuccess: () => void
}

const StudentLoginModal: React.FC<StudentLoginModalProps> = ({ onClose, onLoginSuccess }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'sms' | 'login' | 'register'>('sms')
  const [loginData, setLoginData] = useState({
    idCard: '',
    password: ''
  })
  const [smsData, setSmsData] = useState({
    phone: '',
    code: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isSending, setIsSending] = useState(false)

  const handleLogin = async () => {
    if (!loginData.idCard || !loginData.password) {
      alert('请输入身份证号和密码')
      return
    }

    if (loginData.idCard.length !== 18) {
      alert('请输入正确的18位身份证号')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idCard: loginData.idCard,
          password: loginData.password
        })
      })
      const result = await response.json()

      if (result.success) {
        localStorage.setItem('studentLoggedIn', 'true')
        localStorage.setItem('studentIdCard', result.data.idCard)
        alert('登录成功！')
        onLoginSuccess()
      } else {
        alert(result.message || '登录失败')
      }
    } catch (error) {
      alert('网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendSmsCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(smsData.phone)) {
      alert('请输入正确的11位手机号')
      return
    }

    setIsSending(true)
    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: smsData.phone, type: 'login' })
      })
      const result = await response.json()

      if (result.success) {
        alert('验证码已发送至 ' + smsData.phone)
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

  const handleSmsLogin = async () => {
    if (!smsData.phone || !smsData.code) {
      alert('请输入手机号和验证码')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: smsData.phone,
          code: smsData.code
        })
      })
      const result = await response.json()

      if (result.success) {
        localStorage.setItem('studentLoggedIn', 'true')
        localStorage.setItem('studentIdCard', result.data.idCard)
        alert('登录成功！')
        onLoginSuccess()
      } else {
        alert(result.message || '登录失败')
      }
    } catch (error) {
      alert('网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = () => {
    onClose()
    navigate('/student/register')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (activeTab === 'login') {
        handleLogin()
      } else if (activeTab === 'sms') {
        handleSmsLogin()
      }
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        <div className={styles.modalHeader}>
          <img
            src="/source/logo2.png"
            alt="广东以色列理工学院"
            className={styles.logo}
          />
          <h2 className={styles.title}>学生登录</h2>
        </div>

        <div className={styles.tabContainer}>
          <button
            className={`${styles.tab} ${activeTab === 'sms' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('sms')}
          >
            短信登录
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'login' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('login')}
          >
            密码登录
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'register' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('register')}
          >
            注册 Register
          </button>
        </div>

        {activeTab === 'sms' ? (
          <div className={styles.formContainer}>
            <div className={styles.formGroup}>
              <label>手机号</label>
              <input
                type="tel"
                className={styles.input}
                value={smsData.phone}
                onChange={(e) => setSmsData({ ...smsData, phone: e.target.value })}
                onKeyPress={handleKeyPress}
                placeholder="请输入注册时的手机号"
                maxLength={11}
                autoFocus
              />
            </div>

            <div className={styles.formGroup}>
              <label>验证码</label>
              <div className={styles.passwordInput}>
                <input
                  type="text"
                  className={styles.input}
                  value={smsData.code}
                  onChange={(e) => setSmsData({ ...smsData, code: e.target.value })}
                  onKeyPress={handleKeyPress}
                  placeholder="请输入短信验证码"
                  maxLength={6}
                />
                <button
                  type="button"
                  className={styles.smsBtn}
                  onClick={handleSendSmsCode}
                  disabled={countdown > 0 || isSending || !/^1[3-9]\d{9}$/.test(smsData.phone)}
                >
                  {isSending ? '...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
                </button>
              </div>
            </div>

            <button
              className={styles.loginBtn}
              onClick={handleSmsLogin}
              disabled={isLoading}
            >
              {isLoading ? '登录中...' : '登录 Login'}
            </button>
          </div>
        ) : activeTab === 'login' ? (
          <div className={styles.formContainer}>
            <div className={styles.formGroup}>
              <label>身份证号</label>
              <input
                type="text"
                className={styles.input}
                value={loginData.idCard}
                onChange={(e) => setLoginData({ ...loginData, idCard: e.target.value })}
                onKeyPress={handleKeyPress}
                placeholder="请输入18位身份证号"
                maxLength={18}
                autoFocus
              />
            </div>

            <div className={styles.formGroup}>
              <label>密码</label>
              <div className={styles.passwordInput}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  onKeyPress={handleKeyPress}
                  placeholder="请输入密码"
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

            <button
              className={styles.loginBtn}
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? '登录中...' : '登录 Login'}
            </button>
          </div>
        ) : (
          <div className={styles.registerContainer}>
            <div className={styles.registerInfo}>
              <p>📝 还没有账号？</p>
              <p>请先注册账号后再进行申请</p>
            </div>
            <button className={styles.registerBtn} onClick={handleRegister}>
              前往注册 Go to Register
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentLoginModal

export const checkStudentLogin = (): boolean => {
  return localStorage.getItem('studentLoggedIn') === 'true'
}

export const studentLogout = () => {
  localStorage.removeItem('studentLoggedIn')
  localStorage.removeItem('studentIdCard')
}
