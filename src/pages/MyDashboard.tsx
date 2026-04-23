import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { studentLogout } from '../components/StudentLoginModal'
import { getApplicationState } from '../store/applicationStore'
import { applicationAPI } from '../services/api'
import styles from './MyDashboard.module.css'

const MyDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [appState, setAppState] = useState<any>({
    status: 'not_submitted',
    isLocked: false
  })
  const [savedProgress, setSavedProgress] = useState<any>(null)
  const [showModifyModal, setShowModifyModal] = useState(false)
  const [modifyReason, setModifyReason] = useState('')
  const [modifyAttachments, setModifyAttachments] = useState<any[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [studentPhone, setStudentPhone] = useState('')
  const [studentName, setStudentName] = useState('')
  const [showChangePhone, setShowChangePhone] = useState(false)
  const [newPhone, setNewPhone] = useState('')
  const [phoneCode, setPhoneCode] = useState('')
  const [phoneCountdown, setPhoneCountdown] = useState(0)
  const [isPhoneSending, setIsPhoneSending] = useState(false)
  
  // 刷新申请状态
  const refreshStatus = async () => {
    setIsRefreshing(true)
    try {
      const state = await getApplicationState()
      setAppState(state)
    } catch (error) {
      console.error('刷新状态失败:', error)
    } finally {
      setIsRefreshing(false)
    }
  }
  
  // 异步加载申请状态
  useEffect(() => {
    refreshStatus()
  }, [])
  
  // 自动刷新状态（每30秒）
  useEffect(() => {
    const interval = setInterval(() => {
      refreshStatus()
    }, 30000) // 30秒刷新一次
    
    return () => clearInterval(interval)
  }, [])
  
  // 获取奖学金类型
  const scholarshipType = localStorage.getItem('scholarshipType') as 'subject' | 'innovation' | null
  
  const getScholarshipTypeName = () => {
    if (!scholarshipType) return '未选择'
    return scholarshipType === 'subject' ? '学科特长奖学金' : '创新潜质奖学金'
  }
  
  const studentIdCard = localStorage.getItem('studentIdCard') || ''

  const fetchProfile = async () => {
    if (!studentIdCard) return
    try {
      const response = await fetch(`/api/auth/profile?idCard=${encodeURIComponent(studentIdCard)}`)
      const result = await response.json()
      if (result.success) {
        setStudentName(result.data.fullName)
        setStudentPhone(result.data.phone || '')
      }
    } catch (error) {
      console.error('获取个人信息失败:', error)
    }
  }

  const handleSendPhoneCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(newPhone)) {
      alert('请输入正确的11位手机号')
      return
    }
    setIsPhoneSending(true)
    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: newPhone, type: 'register' })
      })
      const result = await response.json()
      if (result.success) {
        alert('验证码已发送至 ' + newPhone)
        setPhoneCountdown(60)
        const timer = setInterval(() => {
          setPhoneCountdown(prev => {
            if (prev <= 1) { clearInterval(timer); return 0 }
            return prev - 1
          })
        }, 1000)
      } else {
        alert(result.message || '发送失败')
      }
    } catch (error) {
      alert('网络错误')
    } finally {
      setIsPhoneSending(false)
    }
  }

  const handleChangePhone = async () => {
    if (!newPhone || !phoneCode) {
      alert('请输入新手机号和验证码')
      return
    }
    try {
      const response = await fetch('/api/auth/change-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idCard: studentIdCard, newPhone, code: phoneCode })
      })
      const result = await response.json()
      if (result.success) {
        alert('手机号更换成功！')
        setStudentPhone(newPhone)
        setShowChangePhone(false)
        setNewPhone('')
        setPhoneCode('')
      } else {
        alert(result.message || '更换失败')
      }
    } catch (error) {
      alert('网络错误')
    }
  }

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('studentLoggedIn')
    if (!isLoggedIn) {
      alert('请先登录')
      navigate('/')
      return
    }

    fetchProfile()

    // 加载保存的申请进度
    const savedData = localStorage.getItem('applicationFormData')
    const savedStep = localStorage.getItem('applicationCurrentStep')
    if (savedData) {
      setSavedProgress({
        data: JSON.parse(savedData),
        step: savedStep ? parseInt(savedStep) : 0,
        savedTime: localStorage.getItem('applicationSavedTime') || ''
      })
    }
  }, [navigate])
  
  // 监听申请状态变化，自动清除进度显示
  useEffect(() => {
    // 如果申请已提交或被锁定，清除保存的进度显示
    if (appState.status !== 'not_submitted' || appState.isLocked) {
      setSavedProgress(null)
    }
  }, [appState.status, appState.isLocked])

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      studentLogout()
      alert('已退出登录')
      navigate('/')
    }
  }

  const handleStartApplication = () => {
    navigate('/student')
  }

  const handleContinueApplication = () => {
    navigate('/student')
  }
  
  const handleRequestModify = () => {
    setShowModifyModal(true)
  }
  
  const handleSubmitModifyRequest = async () => {
    if (!modifyReason || modifyReason.trim() === '') {
      alert('请说明需要修改的内容')
      return
    }
    
    try {
      const idCard = localStorage.getItem('studentIdCard')
      if (!idCard) {
        alert('未找到身份证信息，请重新登录')
        return
      }

      // 保存修改原因和附件到localStorage（记录用途）
      localStorage.setItem('modifyReason', modifyReason)
      localStorage.setItem('modifyAttachments', JSON.stringify(modifyAttachments))
      localStorage.setItem('modifyUsed', 'true')
      
      // 直接解锁申请，允许修改
      await applicationAPI.requestModify(idCard, modifyReason, modifyAttachments)
      
      alert('✅ 申请已解锁！\n\n您现在可以重新编辑申请表。\n⚠️ 提醒：每个学生仅有一次修改机会，修改后请仔细核对后再次提交。')
      setShowModifyModal(false)
      setModifyReason('')
      setModifyAttachments([])
      
      // 刷新申请状态
      const state = await getApplicationState()
      setAppState(state)
      
      // 直接跳转到申请表页面
      navigate('/student')
    } catch (error: any) {
      alert('❌ 解锁失败：' + (error.message || '未知错误'))
    }
  }
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    
    try {
      const file = files[0]
      if (file.size > 10 * 1024 * 1024) {
        alert('文件大小不能超过10MB')
        return
      }
      
      const reader = new FileReader()
      reader.onload = () => {
        setModifyAttachments([...modifyAttachments, {
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: reader.result as string
        }])
        alert('✅ 附件上传成功')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      alert('附件上传失败')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'not_submitted':
        return { text: '未提交', color: '#f59e0b', bg: '#fef3c7' }
      case 'pending':
        return { text: '审核中', color: '#3b82f6', bg: '#dbeafe' }
      case 'approved':
        return { text: '已通过', color: '#10b981', bg: '#d1fae5' }
      case 'rejected':
        return { text: '未通过', color: '#ef4444', bg: '#fee2e2' }
      default:
        return { text: '未知', color: '#6b7280', bg: '#f3f4f6' }
    }
  }

  const status = getStatusBadge(appState.status)
  
  const getStepNames = () => {
    if (scholarshipType === 'subject') {
      return [
        '申请须知',
        '个人基本信息',
        '家庭基本信息',
        '高中学习经历',
        '竞赛获奖信息',
        '上传报名材料',
        '报名信息预览'
      ]
    } else {
      return [
        '申请须知',
        '个人基本信息',
        '家庭基本信息',
        '高中学习经历',
        '高中学习成绩',
        '上传报名材料',
        '报名信息预览'
      ]
    }
  }
  
  const stepNames = getStepNames()

  return (
    <div className={styles.dashboardContainer}>
      {/* 顶部导航 */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <img
            src="/source/logo2.png"
            alt="广东以色列理工学院"
            className={styles.logo}
          />
          <h1 className={styles.title}>我的面板</h1>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.homeBtn} onClick={() => navigate('/')}>
            🏠 返回首页
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            🚪 退出登录
          </button>
        </div>
      </header>

      {/* 主内容 */}
      <div className={styles.content}>
        {/* 用户信息卡片 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>👤 个人信息</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>姓名：</span>
                <span className={styles.infoValue}>{studentName || '加载中...'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>身份证号：</span>
                <span className={styles.infoValue}>{studentIdCard}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>手机号：</span>
                <span className={styles.infoValue}>
                  {studentPhone ? studentPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '未绑定'}
                  <button
                    onClick={() => setShowChangePhone(!showChangePhone)}
                    style={{
                      marginLeft: '12px',
                      padding: '2px 10px',
                      fontSize: '12px',
                      background: 'transparent',
                      color: '#0132b2',
                      border: '1px solid #0132b2',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {showChangePhone ? '取消' : '更换'}
                  </button>
                </span>
              </div>
              {showChangePhone && (
                <div className={styles.infoItem} style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="输入新手机号"
                      maxLength={11}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        width: '140px'
                      }}
                    />
                    <button
                      onClick={handleSendPhoneCode}
                      disabled={phoneCountdown > 0 || isPhoneSending || !/^1[3-9]\d{9}$/.test(newPhone)}
                      style={{
                        padding: '8px 12px',
                        fontSize: '12px',
                        background: '#0132b2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: phoneCountdown > 0 ? 'not-allowed' : 'pointer',
                        opacity: phoneCountdown > 0 ? 0.6 : 1
                      }}
                    >
                      {isPhoneSending ? '...' : phoneCountdown > 0 ? `${phoneCountdown}s` : '发送验证码'}
                    </button>
                    <input
                      type="text"
                      value={phoneCode}
                      onChange={(e) => setPhoneCode(e.target.value)}
                      placeholder="验证码"
                      maxLength={6}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        width: '80px'
                      }}
                    />
                    <button
                      onClick={handleChangePhone}
                      style={{
                        padding: '8px 16px',
                        fontSize: '12px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      确认更换
                    </button>
                  </div>
                </div>
              )}
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>申请类型：</span>
                <span className={styles.infoValue} style={{ 
                  color: scholarshipType === 'subject' ? '#92400e' : '#1e40af',
                  fontWeight: '600'
                }}>
                  {getScholarshipTypeName()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 申请状态卡片 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>📝 申请状态</h2>
            <span 
              className={styles.statusBadge}
              style={{ 
                color: status.color, 
                background: status.bg 
              }}
            >
              {status.text}
            </span>
          </div>
          <div className={styles.cardBody}>
            {appState.status === 'not_submitted' && (
              <>
                {savedProgress ? (
                  <div className={styles.progressInfo}>
                    <div className={styles.progressHeader}>
                      <span className={styles.progressIcon}>💾</span>
                      <div>
                        <h3>有未完成的申请</h3>
                        <p className={styles.progressTime}>
                          上次保存时间：{savedProgress.savedTime}
                        </p>
                      </div>
                    </div>
                    <div className={styles.progressDetail}>
                      <p>当前进度：<strong>{stepNames[savedProgress.step]}</strong></p>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${(savedProgress.step / (stepNames.length - 1)) * 100}%` }}
                        ></div>
                      </div>
                      <p className={styles.progressPercent}>
                        {Math.round((savedProgress.step / (stepNames.length - 1)) * 100)}% 完成
                      </p>
                    </div>
                    <button 
                      className={styles.btnPrimary}
                      onClick={handleContinueApplication}
                    >
                      📋 继续填写申请
                    </button>
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>📄</span>
                    <h3>还未开始申请</h3>
                    <p>点击下方按钮开始填写创新潜质奖学金申请表</p>
                    <button 
                      className={styles.btnPrimary}
                      onClick={handleStartApplication}
                    >
                      🚀 开始申请
                    </button>
                  </div>
                )}
              </>
            )}
            
            {appState.status === 'pending' && (
              <div className={styles.statusInfo}>
                <span className={styles.statusIcon}>⏳</span>
                <div>
                  <h3>申请已提交</h3>
                  <p>提交时间：{appState.submitDate}</p>
                  <p className={styles.statusDesc}>
                    您的申请正在审核中，请耐心等待。入围结果将于 <strong>6月中旬</strong> 公布。
                  </p>
                  
                  {/* 显示修改请求状态 */}
                  {appState.modifyRequested && !appState.modifyApproved && (
                    <div style={{ 
                      background: '#fef3c7', 
                      padding: '12px', 
                      borderRadius: '8px', 
                      marginTop: '12px',
                      borderLeft: '4px solid #f59e0b'
                    }}>
                      <p style={{ margin: 0, fontSize: '13px', color: '#92400e' }}>
                        ⏳ 您的修改请求正在等待管理员审核...
                      </p>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <button 
                      className={styles.btnSecondary}
                      onClick={handleContinueApplication}
                    >
                      📄 查看申请详情
                    </button>
                    
                    <button 
                      className={styles.btnSecondary}
                      onClick={refreshStatus}
                      disabled={isRefreshing}
                      style={{ 
                        opacity: isRefreshing ? 0.6 : 1,
                        cursor: isRefreshing ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isRefreshing ? '🔄 刷新中...' : '🔄 刷新状态'}
                    </button>
                    
                    {/* 只有在没有申请修改或已使用修改机会时显示申请修改按钮 */}
                    {!appState.modifyUsed && !appState.modifyRequested && (
                      <button 
                        className={styles.btnPrimary}
                        onClick={handleRequestModify}
                        style={{ background: '#f59e0b' }}
                      >
                        ✏️ 申请修改
                      </button>
                    )}
                  </div>
                  
                  {!appState.modifyUsed && !appState.modifyRequested && (
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '12px' }}>
                      💡 如发现信息填写错误，可申请修改（仅有一次机会）
                    </p>
                  )}
                  
                  {appState.modifyUsed && (
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '12px' }}>
                      ℹ️ 您已使用过修改机会
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {appState.status === 'approved' && (
              <div className={styles.statusInfo}>
                <span className={styles.statusIcon}>🎉</span>
                <div>
                  <h3>恭喜！申请已通过</h3>
                  <p>审核时间：{appState.reviewDate}</p>
                  <p className={styles.statusDesc}>
                    恭喜您成功入围创新潜质奖学金！请关注后续通知。
                  </p>
                  <button 
                    className={styles.btnSecondary}
                    onClick={handleContinueApplication}
                  >
                    📄 查看申请详情
                  </button>
                </div>
              </div>
            )}
            
            {appState.status === 'rejected' && (
              <div className={styles.statusInfo}>
                <span className={styles.statusIcon}>❌</span>
                <div>
                  <h3>很遗憾，申请未通过</h3>
                  <p>审核时间：{appState.reviewDate}</p>
                  <p className={styles.statusDesc}>
                    感谢您对创新潜质奖学金的关注，期待未来有机会再次申请。
                  </p>
                  <button 
                    className={styles.btnSecondary}
                    onClick={handleContinueApplication}
                  >
                    📄 查看申请详情
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 帮助信息 */}
        <div className={styles.helpCard}>
          <h3>📞 需要帮助？</h3>
          <div className={styles.helpInfo}>
            <p>咨询电话：<strong>0754-88077077</strong></p>
            <p>咨询邮箱：<strong>sci-scholarship@gtiit.edu.cn</strong></p>
            <p>技术支持QQ：<strong>2241784329</strong></p>
          </div>
        </div>
      </div>

      {/* 申请修改弹窗 */}
      {showModifyModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => setShowModifyModal(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, color: '#0132b2', fontSize: '24px' }}>✏️ 申请修改</h2>
              <button
                onClick={() => setShowModifyModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '8px', marginBottom: '24px', borderLeft: '4px solid #f59e0b' }}>
              <p style={{ margin: '0 0 8px', fontWeight: '600', color: '#92400e' }}>📢 重要提示</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#78350f', lineHeight: '1.6' }}>
                • 每个学生仅有<strong>一次</strong>申请修改机会<br/>
                • 需要清楚说明要修改的内容（如：姓名拼音有误、成绩填写错误等）<br/>
                • 如需修改附件，请上传正确的附件文件<br/>
                • 管理员审核通过后，您的申请将解锁，可重新编辑
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1f2937' }}>
                需要修改的内容<span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                value={modifyReason}
                onChange={(e) => setModifyReason(e.target.value)}
                placeholder="请详细说明需要修改的内容，例如：&#10;1. 姓名拼音填写错误，应该是...&#10;2. 考试一数学成绩填写错误，应该是...&#10;3. 需要更换身份证扫描件"
                style={{
                  width: '100%',
                  minHeight: '150px',
                  padding: '12px',
                  border: '1px solid #d0d7e2',
                  borderRadius: '6px',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1f2937' }}>
                上传佐证材料（选填）
              </label>
              <input 
                type="file" 
                id="modifyAttachment" 
                accept=".pdf,.jpg,.jpeg,.png" 
                style={{ display: 'none' }}
                multiple
                onChange={handleFileUpload}
              />
              <label 
                htmlFor="modifyAttachment"
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  border: '1px dashed #d0d7e2',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                📎 点击上传附件
              </label>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                如需更换附件（如身份证、成绩单等），请在此上传正确的文件
              </p>
              
              {modifyAttachments.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  {modifyAttachments.map((file, index) => (
                    <div 
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        marginBottom: '8px'
                      }}
                    >
                      <span style={{ fontSize: '13px' }}>✅ {file.name}</span>
                      <button
                        onClick={() => setModifyAttachments(modifyAttachments.filter((_, i) => i !== index))}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        删除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModifyModal(false)}
                style={{
                  padding: '10px 24px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '500'
                }}
              >
                取消
              </button>
              <button
                onClick={handleSubmitModifyRequest}
                style={{
                  padding: '10px 24px',
                  background: '#0132b2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '500'
                }}
              >
                提交修改请求
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyDashboard

