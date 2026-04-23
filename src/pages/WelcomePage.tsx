import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentLoginModal, { checkStudentLogin, studentLogout } from '../components/StudentLoginModal'
import { checkScholarshipConflict, getScholarshipTypeName } from '../store/applicationStore'
import styles from './WelcomePage.module.css'

const WelcomePage: React.FC = () => {
  const navigate = useNavigate()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [redirectPath, setRedirectPath] = useState<string | null>(null)

  useEffect(() => {
    // 检查登录状态
    setIsLoggedIn(checkStudentLogin())
  }, [])

  const handleApplyClick = async (scholarshipType: 'subject' | 'innovation') => {
    // 检查是否已提交了其他类型的奖学金申请（互斥校验）
    const conflictScholarship = await checkScholarshipConflict(scholarshipType)
    if (conflictScholarship) {
      const targetScholarshipName = getScholarshipTypeName(scholarshipType)
      alert(`您已申请${conflictScholarship}，无法申请${targetScholarshipName}`)
      return
    }
    
    // 检查是否切换了奖学金类型（仅针对未提交的进度）
    const currentScholarshipType = localStorage.getItem('scholarshipType')
    if (currentScholarshipType && currentScholarshipType !== scholarshipType) {
      // 切换了奖学金类型，清除之前的申请数据
      if (window.confirm('检测到您要切换申请的奖学金类型，这将清除之前保存的申请进度。确定要继续吗？')) {
        localStorage.removeItem('applicationFormData')
        localStorage.removeItem('applicationCurrentStep')
        localStorage.removeItem('applicationMaxStep')
        localStorage.removeItem('applicationAgreed')
        localStorage.removeItem('applicationSavedTime')
        localStorage.removeItem('competitionAwards')
      } else {
        return // 用户取消切换
      }
    }
    
    // 保存奖学金类型
    localStorage.setItem('scholarshipType', scholarshipType)
    
    // 检查学生是否已登录
    if (checkStudentLogin()) {
      // 已登录，直接跳转到申请系统
      navigate('/student')
    } else {
      // 未登录，弹出登录框，并设置登录成功后跳转
      setRedirectPath('/student')
      setShowLoginModal(true)
    }
  }

  const handleLoginSuccess = () => {
    // 登录成功后关闭弹窗
    setShowLoginModal(false)
    setIsLoggedIn(true)
    
    // 如果有指定跳转路径，则跳转
    if (redirectPath) {
      navigate(redirectPath)
    }
    // 否则留在当前页面（主页）
  }

  const handleStudentLogin = () => {
    // 点击学生登录按钮时，弹出登录框，不设置跳转路径（即留在主页）
    setRedirectPath(null)
    setShowLoginModal(true)
  }

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      studentLogout()
      setIsLoggedIn(false)
      alert('已退出登录')
    }
  }

  const handleMyDashboard = () => {
    navigate('/my-dashboard')
  }

  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.backgroundOverlay}></div>
      
      <header className={styles.header}>
        <div 
          className={styles.headerContent} 
          onClick={() => window.location.reload()} 
          style={{ cursor: 'pointer' }}
          title="刷新页面"
        >
          <img
            src="/source/logo2.png"
            alt="广东以色列理工学院"
            className={styles.logo}
          />
        </div>
        <div className={styles.headerRight}>
          {isLoggedIn && (
            <button 
              className={styles.myDashboardLink}
              onClick={handleMyDashboard}
            >
              📊 我的面板
            </button>
          )}
          <a 
            href="https://www.gtiit.edu.cn" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.officialLink}
          >
            官网 | 广东以色列理工学院
          </a>
        </div>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.titleSection}>
          <h2 className={styles.mainTitle}>2026广东以色列理工学院奖学金申请系统</h2>
          <p className={styles.englishTitle}>
            GTIIT - SCHOLARSHIP APPLICATION SYSTEM
          </p>
        </div>

        <div className={styles.scholarshipCards}>
          {/* 学科特长奖学金 */}
          <div className={styles.scholarshipCard}>
            <div className={styles.cardHeader} style={{ background: '#f59e0b' }}>
              <h3>学科特长奖学金</h3>
              <p className={styles.cardSubtitle}>Subject Specialty Scholarship</p>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.conditionBox} style={{ borderLeftColor: '#f59e0b' }}>
                <strong style={{ color: '#d97706' }}>申请条件：</strong>
                <p>高中阶段获得全国中学生奥林匹克竞赛（数学、物理、化学、生物、信息学）省级三等奖及以上，并经过全国青少年科技竞赛获奖公示（<a href="http://gs.cyscc.org/" target="_blank" rel="noopener noreferrer">http://gs.cyscc.org/</a>）的高三学生。</p>
              </div>
              <div className={styles.conditionBox} style={{ borderLeftColor: '#f59e0b' }}>
                <strong style={{ color: '#d97706' }}>申请材料：</strong>
                <p>学生本人身份证扫描件（正反面）；奥赛获奖证书扫描件及公示链接。</p>
              </div>
              <div className={styles.deadlineBox} style={{ borderLeftColor: '#f59e0b' }}>
                <p><strong>申请截止日期：</strong>2026年7月5日23时59分</p>
                <p><strong>结果公布日期：</strong>2026年6月中旬起逐批公布</p>
              </div>
              <button 
                className={styles.applyCardButton}
                onClick={() => handleApplyClick('subject')}
                style={{ background: '#f59e0b' }}
              >
                立即申请
              </button>
            </div>
          </div>

          {/* 创新潜质奖学金 */}
          <div className={styles.scholarshipCard}>
            <div className={styles.cardHeader} style={{ background: '#0132b2' }}>
              <h3>创新潜质奖学金</h3>
              <p className={styles.cardSubtitle}>Innovative Potential Scholarship</p>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.conditionBox} style={{ borderLeftColor: '#0132b2' }}>
                <strong style={{ color: '#0132b2' }}>申请条件：</strong>
                <p>高中阶段成绩优秀、综合素质突出，有志于理工科学习，希望接受国际化教育的高三年级学生。</p>
              </div>
              <div className={styles.conditionBox} style={{ borderLeftColor: '#0132b2' }}>
                <strong style={{ color: '#0132b2' }}>申请材料：</strong>
                <p>学生本人身份证扫描件（正反面）；高三年级2次模考成绩及排名（须加盖中学或教务处公章）；其他可反映个人优秀综合素质的证明材料（如有）。</p>
              </div>
              <div className={styles.deadlineBox} style={{ borderLeftColor: '#0132b2', background: '#eff6ff' }}>
                <p><strong style={{ color: '#1e3a5f' }}>申请截止日期：</strong>2026年5月31日23时59分</p>
                <p><strong style={{ color: '#1e3a5f' }}>结果公布日期：</strong>2026年6月中旬</p>
              </div>
              <button 
                className={styles.applyCardButton}
                onClick={() => handleApplyClick('innovation')}
                style={{ background: '#0132b2' }}
              >
                立即申请
              </button>
            </div>
          </div>
        </div>

        {!isLoggedIn && (
          <div className={styles.studentLoginSection}>
            <button className={styles.studentLoginBtn} onClick={handleStudentLogin}>
              学生登录 / 注册
            </button>
          </div>
        )}
        {isLoggedIn && (
          <div className={styles.studentLoginSection}>
            <button className={styles.studentLogoutBtn} onClick={handleLogout}>
              退出登录
            </button>
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerContact}>
          <span>咨询电话：<strong>0754-88077077</strong></span>
          <span className={styles.footerDivider}></span>
          <span>邮箱：<strong>sci-scholarship@gtiit.edu.cn</strong></span>
          <span className={styles.footerDivider}></span>
          <span>技术支持QQ：<strong>2241784329</strong></span>
        </div>
        <p className={styles.footerCopy}>© {new Date().getFullYear()} 广东以色列理工学院 奖学金申请系统</p>
        <div className={styles.footerBottom}>
          <span className={styles.developer}>Powered by <a href="https://cbit.cuhk.edu.cn" target="_blank" rel="noopener noreferrer">CBIT</a></span>
          <span className={styles.adminEntry} onClick={() => navigate('/admin/login')}>管理入口</span>
        </div>
      </footer>

      {showLoginModal && (
        <StudentLoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  )
}

export default WelcomePage

