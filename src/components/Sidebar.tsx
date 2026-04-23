import React from 'react'
import styles from './Sidebar.module.css'

interface Step {
  id: number
  title: string
  completed?: boolean
}

interface SidebarProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (stepId: number) => void
  scholarshipType?: 'subject' | 'innovation'
  maxReachedStep?: number
}

const Sidebar: React.FC<SidebarProps> = ({ steps, currentStep, onStepClick, scholarshipType = 'innovation', maxReachedStep = 999 }) => {
  const handleStepClick = (stepId: number) => {
    if (stepId > maxReachedStep) {
      return
    }
    if (onStepClick) {
      onStepClick(stepId)
    }
  }
  
  const getScholarshipTitle = () => {
    if (scholarshipType === 'subject') {
      return '学科特长奖学金报名信息'
    } else {
      return '创新潜质奖学金报名信息'
    }
  }
  
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarContent}>
        <div className={styles.sidebarLogo}>
          <div className={styles.sidebarTitle}>
            {getScholarshipTitle()}
          </div>
        </div>

        <ul className={styles.stepList}>
          {steps.map((step) => (
            <li
              key={step.id}
              className={`${styles.stepItem} ${
                step.id === currentStep ? styles.active : ''
              } ${step.completed ? styles.completed : ''} ${
                step.id > maxReachedStep ? styles.disabled : ''
              }`}
              onClick={() => handleStepClick(step.id)}
            >
              <span className={styles.stepIcon}>
                {step.completed ? '✓' : step.id}
              </span>
              <span className={styles.stepText}>{step.title}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.sidebarFooter}>
        <img src="/source/logo2.png" alt="GTIIT" className={styles.footerLogo} />
        <div className={styles.systemInfo}>
          <p>广东以色列理工学院</p>
          <p>创新潜质奖学金申请系统</p>
        </div>
        <div className={styles.devInfo}>
          <a href="https://cbit.cuhk.edu.cn" target="_blank" rel="noopener noreferrer" className={styles.cbitLink}>
            Developed by CBIT
          </a>
          <div className={styles.badgeWrapper}>
            <a href="https://github.com/reneverland/" target="_blank" rel="noopener noreferrer">
              <img src="https://img.shields.io/badge/GitHub-Ren_CBIT-181717?logo=github&logoColor=white" alt="GitHub Badge" />
            </a>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

