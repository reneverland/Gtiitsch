import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './AdminLogin.module.css'

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 验证管理员账号密码
    if (username === 'admin' && password === 'Gtiit@2026#RenCBIT!9X') {
      // 保存登录状态到 localStorage
      localStorage.setItem('adminLoggedIn', 'true')
      navigate('/admin/dashboard')
    } else {
      setError('用户名或密码错误')
    }
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.logoContainer}>
          <img 
            src="/source/gtiitlogo.png" 
            alt="广东以色列理工学院" 
            className={styles.logo}
          />
          <h1 className={styles.title}>管理员登录</h1>
          <p className={styles.subtitle}>奖学金申请系统管理后台</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              用户名<span className="required">*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入管理员用户名"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              密码<span className="required">*</span>
            </label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
            />
          </div>

          <button type="submit" className={styles.loginButton}>
            登录
          </button>
        </form>

        <div className={styles.backLink}>
          <a href="/student">返回学生申请页面</a>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin


