import { useNavigate } from 'react-router-dom'
import styles from './Layout.module.css'

interface LayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  headerActions?: React.ReactNode
  title?: string
  subtitle?: string
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  sidebar, 
  headerActions,
  title = '奖学金申请系统',
  subtitle = 'Scholarship Application System'
}) => {
  const navigate = useNavigate()

  return (
    <>
      <header className={styles.topBanner}>
        <div 
          className={styles.logoContainer} 
          onClick={() => navigate('/')} 
          style={{ cursor: 'pointer' }}
          title="返回首页"
        >
          <img 
            src="/source/logo2.png" 
            alt="广东以色列理工学院" 
            className={styles.logo}
          />
        </div>
        <div className={styles.titleContainer}>
          <h1 className={styles.mainTitle}>{title}</h1>
          <h2 className={styles.subTitle}>{subtitle}</h2>
        </div>
        {headerActions && (
          <div className={styles.headerActions}>
            {headerActions}
          </div>
        )}
      </header>

      <main className={styles.pageContainer}>
        <div className={styles.appCard}>
          {sidebar}
          <section className={styles.content}>
            {children}
          </section>
        </div>
      </main>
    </>
  )
}

export default Layout


