import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import ApplicationDetail from '../components/ApplicationDetail'
import EmailModal, { EmailData } from '../components/EmailModal'
import EmailSettings from '../components/EmailSettings'
import { applicationAPI } from '../services/api'
import styles from './AdminDashboard.module.css'

interface Application {
  id: string
  name: string
  idCard: string
  familyName?: string
  givenName?: string
  school: string
  schoolProvince?: string
  schoolCity?: string
  province?: string
  email: string
  gender?: string
  ethnicity?: string
  birthDate?: string
  subjects?: string
  classTeacher?: string
  classTeacherPhone?: string
  schoolAddress?: string
  parentName?: string
  parentPhone?: string
  parentWechat?: string
  address?: string
  zipCode?: string
  scholarshipType?: 'subject' | 'innovation'
  examName?: string
  totalScore?: string
  totalScoreMax?: string
  chinese?: string
  chineseMax?: string
  math?: string
  mathMax?: string
  english?: string
  englishMax?: string
  physics?: string
  physicsMax?: string
  chemistry?: string
  chemistryMax?: string
  classRank?: string
  totalStudents?: string
  examName2?: string
  totalScore2?: string
  totalScoreMax2?: string
  chinese2?: string
  chineseMax2?: string
  math2?: string
  mathMax2?: string
  english2?: string
  englishMax2?: string
  physics2?: string
  physicsMax2?: string
  chemistry2?: string
  chemistryMax2?: string
  classRank2?: string
  totalStudents2?: string
  competitionAwards?: any[]
  idCardAttachment?: any
  scoreSheetAttachment?: any
  competitionAttachments?: any[]
  otherAttachments?: any[]
  submitDate: string
  status: 'pending' | 'approved' | 'rejected' | 'not_submitted'
  notes?: string
}

// 修改请求历史里附件的"预览/下载"按钮（base64 dataUrl → blob 新窗口预览 / 触发下载）
const HistoryAttachmentButton: React.FC<{ file: any }> = ({ file }) => {
  const dataUrl: string = file?.dataUrl || ''
  const fileName: string = file?.name || '附件文件'

  const handlePreview = () => {
    if (!dataUrl) { alert('附件数据缺失，无法预览'); return }
    try {
      if (dataUrl.startsWith('data:')) {
        const [meta, base64] = dataUrl.split(',')
        const mimeMatch = meta.match(/data:([^;]+)/)
        const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream'
        const binary = atob(base64)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        const blob = new Blob([bytes], { type: mime })
        window.open(URL.createObjectURL(blob), '_blank')
      } else {
        window.open(dataUrl, '_blank')
      }
    } catch (e) {
      console.error('预览失败:', e)
      alert('预览失败，请尝试下载查看')
    }
  }
  const handleDownload = () => {
    if (!dataUrl) { alert('附件数据缺失，无法下载'); return }
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', background: '#f3f4f6', borderRadius: '6px', fontSize: '13px', border: '1px solid #e5e7eb' }}>
      <span style={{ color: '#374151', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📎 {fileName}</span>
      <button onClick={handlePreview} style={{ padding: '2px 8px', fontSize: '12px', background: '#0132b2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>👁️ 预览</button>
      <button onClick={handleDownload} style={{ padding: '2px 8px', fontSize: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>⬇️ 下载</button>
    </div>
  )
}

const formatApplicationData = (app: any): Application => ({
  id: String(app.id),
  name: app.name,
  idCard: app.student_id_card || app.idCard,
  familyName: app.family_name,
  givenName: app.given_name,
  school: app.school,
  schoolProvince: app.school_province,
  schoolCity: app.school_city,
  province: app.province,
  email: app.email,
  gender: app.gender,
  ethnicity: app.ethnicity,
  birthDate: app.birth_date,
  subjects: app.subjects,
  classTeacher: app.class_teacher,
  classTeacherPhone: app.class_teacher_phone,
  schoolAddress: app.school_address,
  parentName: app.parent_name,
  parentPhone: app.parent_phone,
  parentWechat: app.parent_wechat,
  address: app.address,
  zipCode: app.zip_code,
  scholarshipType: app.scholarship_type as 'subject' | 'innovation',
  examName: app.exam_name,
  totalScore: app.total_score,
  totalScoreMax: app.total_score_max,
  chinese: app.chinese,
  chineseMax: app.chinese_max,
  math: app.math,
  mathMax: app.math_max,
  english: app.english,
  englishMax: app.english_max,
  physics: app.physics,
  physicsMax: app.physics_max,
  chemistry: app.chemistry,
  chemistryMax: app.chemistry_max,
  classRank: app.class_rank,
  totalStudents: app.total_students,
  examName2: app.exam_name2,
  totalScore2: app.total_score2,
  totalScoreMax2: app.total_score_max2,
  chinese2: app.chinese2,
  chineseMax2: app.chinese_max2,
  math2: app.math2,
  mathMax2: app.math_max2,
  english2: app.english2,
  englishMax2: app.english_max2,
  physics2: app.physics2,
  physicsMax2: app.physics_max2,
  chemistry2: app.chemistry2,
  chemistryMax2: app.chemistry_max2,
  classRank2: app.class_rank2,
  totalStudents2: app.total_students2,
  competitionAwards: app.competition_awards,
  idCardAttachment: app.id_card_attachment ? (typeof app.id_card_attachment === 'string' ? (() => { try { return JSON.parse(app.id_card_attachment) } catch { return null } })() : app.id_card_attachment) : null,
  scoreSheetAttachment: app.score_sheet_attachment ? (typeof app.score_sheet_attachment === 'string' ? (() => { try { return JSON.parse(app.score_sheet_attachment) } catch { return null } })() : app.score_sheet_attachment) : null,
  competitionAttachments: app.competition_attachments || [],
  otherAttachments: app.other_attachments || [],
  submitDate: app.submit_date,
  status: app.status as 'pending' | 'approved' | 'rejected' | 'not_submitted',
  notes: app.notes || ''
})

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [applications, setApplications] = useState<Application[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [scholarshipTypeFilter, setScholarshipTypeFilter] = useState<'all' | 'subject' | 'innovation'>('all')
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [loadDetailError, setLoadDetailError] = useState<string | null>(null)
  const [emailRecipient, setEmailRecipient] = useState<{ name: string; email: string } | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showEmailSettings, setShowEmailSettings] = useState(false)
  const [showModifyRequests, setShowModifyRequests] = useState(false)
  const [modifyRequests, setModifyRequests] = useState<any[]>([])
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const isLoadingRef = useRef(false)
  const [viewMode, setViewMode] = useState<'active' | 'archived'>('active')
  const viewModeRef = useRef<'active' | 'archived'>('active')

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn')
    if (!isLoggedIn) {
      navigate('/admin/login')
      return
    }

    const loadApplications = async (showAlertOnError: boolean = true) => {
      if (isLoadingRef.current) {
        console.log('[loadApplications] 上一次请求未完成，跳过本次')
        return
      }
      isLoadingRef.current = true
      setIsRefreshing(true)

      const timeoutMs = 60000
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('请求超时（60秒）')), timeoutMs)
      })

      try {
        const apiCall = viewModeRef.current === 'archived'
          ? applicationAPI.getArchived()
          : applicationAPI.getAll()
        const response: any = await Promise.race([apiCall, timeoutPromise])

        if (response && response.success && response.applications) {
          setApplications(response.applications.map(formatApplicationData))
        } else if (response && response.success) {
          setApplications([])
        }
        setLastRefreshTime(new Date().toLocaleTimeString('zh-CN', { hour12: false }))
      } catch (error) {
        console.error('加载申请数据失败:', error)
        if (showAlertOnError) {
          alert('加载数据失败：' + (error as Error).message)
        }
      } finally {
        isLoadingRef.current = false
        setIsRefreshing(false)
      }
    }

    // 静默拉取修改请求历史（用于顶栏数字徽标，不影响主流程）
    const loadModifyHistorySilently = async () => {
      try {
        const response = await applicationAPI.getPendingModifications()
        if (response && response.success && Array.isArray(response.data)) {
          setModifyRequests(response.data)
        }
      } catch (e) {
        console.warn('拉取修改请求历史失败（静默）:', e)
      }
    }

    loadApplications(true)
    loadModifyHistorySilently()

    const intervalId = setInterval(() => {
      loadApplications(false)
      loadModifyHistorySilently()
    }, 30000)

    return () => clearInterval(intervalId)
  }, [navigate])
  
  // 加载修改请求
  const loadModifyRequests = async () => {
    try {
      const response = await applicationAPI.getPendingModifications()
      if (response.success && response.data) {
        setModifyRequests(response.data)
      } else {
        setModifyRequests([])
      }
    } catch (error) {
      console.error('加载修改请求失败:', error)
      setModifyRequests([])
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn')
    navigate('/admin/login')
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = scholarshipTypeFilter === 'all' || app.scholarshipType === scholarshipTypeFilter
    
    return matchesSearch && matchesType
  })

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待审核'
      case 'approved':
        return '已通过'
      case 'rejected':
        return '已拒绝'
      default:
        return status
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending':
        return styles.statusPending
      case 'approved':
        return styles.statusApproved
      case 'rejected':
        return styles.statusRejected
      default:
        return ''
    }
  }

  const handleViewDetails = async (id: string) => {
    const listApp = applications.find(a => a.id === id)
    if (!listApp) return

    setSelectedApp(listApp)
    setLoadDetailError(null)
    setIsLoadingDetail(true)
    try {
      const response: any = await applicationAPI.getById(id)
      if (response && response.success && response.application) {
        const fullApp = formatApplicationData(response.application)
        setSelectedApp(prev => (prev && prev.id === id ? fullApp : prev))
      } else {
        setLoadDetailError(response?.message || '后端返回数据异常')
      }
    } catch (error) {
      console.error('加载申请详情失败:', error)
      setLoadDetailError((error as Error).message || '网络错误')
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const reloadApplications = async () => {
    if (isLoadingRef.current) {
      console.log('[reloadApplications] 上一次请求未完成，跳过本次')
      return
    }
    isLoadingRef.current = true
    setIsRefreshing(true)

    const timeoutMs = 60000
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('请求超时（60秒）')), timeoutMs)
    })

    try {
      const apiCall = viewModeRef.current === 'archived'
        ? applicationAPI.getArchived()
        : applicationAPI.getAll()
      const response: any = await Promise.race([apiCall, timeoutPromise])
      if (response && response.success && response.applications) {
        setApplications(response.applications.map(formatApplicationData))
      } else if (response && response.success) {
        setApplications([])
      }
      setLastRefreshTime(new Date().toLocaleTimeString('zh-CN', { hour12: false }))
    } catch (error) {
      console.error('刷新申请数据失败:', error)
    } finally {
      isLoadingRef.current = false
      setIsRefreshing(false)
    }
  }

  // 切换 tab：当前申请 / 已归档
  const switchViewMode = (mode: 'active' | 'archived') => {
    if (viewMode === mode) return
    viewModeRef.current = mode
    setViewMode(mode)
    setSelectedIds(new Set())
    setApplications([])
    reloadApplications()
  }

  // 从归档恢复
  const handleRestore = async (id: string) => {
    const app = applications.find(a => a.id === id)
    if (!app) return
    if (!window.confirm(`确定要恢复 ${app.name} 的申请到当前列表吗？`)) return
    try {
      await applicationAPI.restore(parseInt(id))
      setApplications(applications.filter(a => a.id !== id))
      alert('已恢复！可在「当前申请」中查看')
    } catch (error) {
      console.error('恢复失败:', error)
      alert('恢复失败：' + (error as Error).message)
    }
  }

  // 永久删除（不可恢复）
  const handleForceDelete = async (id: string) => {
    const app = applications.find(a => a.id === id)
    if (!app) return
    if (!window.confirm(`⚠️ 永久删除警告 ⚠️\n\n确定要永久删除 ${app.name} 的申请吗？\n\n此操作不可恢复！`)) return
    if (!window.confirm(`请再次确认：真的要永久删除 ${app.name} 的申请记录吗？`)) return
    try {
      await applicationAPI.forceDelete(parseInt(id))
      setApplications(applications.filter(a => a.id !== id))
      alert('已永久删除')
    } catch (error) {
      console.error('永久删除失败:', error)
      alert('永久删除失败：' + (error as Error).message)
    }
  }

  const handleApprove = async (id: string, notes: string) => {
    try {
      await applicationAPI.updateStatus(parseInt(id), 'approved', notes)
      setSelectedApp(null)
      alert('✅ 审核通过！邮件通知已发送给申请人。')
      await reloadApplications()
    } catch (error) {
      console.error('审核失败:', error)
      alert('❌ 审核失败，请重试')
    }
  }

  const handleReject = async (id: string, notes: string) => {
    try {
      await applicationAPI.updateStatus(parseInt(id), 'rejected', notes)
      setSelectedApp(null)
      alert('✅ 已拒绝申请！邮件通知已发送给申请人。')
      await reloadApplications()
    } catch (error) {
      console.error('审核失败:', error)
      alert('❌ 审核失败，请重试')
    }
  }

  const handleSendEmail = (recipient: { name: string; email: string }) => {
    setEmailRecipient(recipient)
  }

  const handleEmailSend = (emailData: EmailData) => {
    // 这里应该调用后端API发送邮件
    console.log('发送邮件:', emailData)
    setTimeout(() => {
      alert(`邮件已发送至 ${emailData.to}`)
      setEmailRecipient(null)
    }, 1000)
  }

  const handleExportExcel = () => {
    // 准备导出数据
    const exportData = filteredApplications.map(app => {
      const baseData: Record<string, string> = {
        '奖学金类型': app.scholarshipType === 'subject' ? '学科特长' : '创新潜质',
        '姓名': app.name,
        '身份证号': app.idCard,
        '姓（拼音）': app.familyName || '',
        '名（拼音）': app.givenName || '',
        '性别': app.gender || '',
        '民族': app.ethnicity || '',
        '出生日期': app.birthDate || '',
        '邮箱': app.email,
        '选考科目': app.subjects || '',
        '学校省份': app.schoolProvince || '',
        '学校城市': app.schoolCity || '',
        '高中学校': app.school,
        '班主任姓名': app.classTeacher || '',
        '班主任电话': app.classTeacherPhone || '',
        '家长姓名': app.parentName || '',
        '家长电话': app.parentPhone || '',
        '家庭地址': app.address || '',
      }

      if (app.scholarshipType === 'subject') {
        const awards = app.competitionAwards || []
        const parsedAwards = typeof awards === 'string' ? (() => { try { return JSON.parse(awards) } catch { return [] } })() : awards
        if (Array.isArray(parsedAwards)) {
          parsedAwards.forEach((award: any, i: number) => {
            baseData[`竞赛${i + 1}名称`] = award.name || ''
            baseData[`竞赛${i + 1}颁发单位`] = award.issuer || ''
            baseData[`竞赛${i + 1}获奖时间`] = award.awardTime || ''
            baseData[`竞赛${i + 1}获奖等级`] = award.awardLevel || ''
            baseData[`竞赛${i + 1}是否公示`] = award.isPublished || ''
            baseData[`竞赛${i + 1}公示链接`] = award.publicLink || ''
          })
        }
      } else {
        baseData['考试一名称'] = app.examName || ''
        baseData['考试一总分'] = app.totalScore || ''
        baseData['考试一语文'] = app.chinese || ''
        baseData['考试一数学'] = app.math || ''
        baseData['考试一英语'] = app.english || ''
        baseData['考试一物理'] = app.physics || ''
        baseData['考试一化学'] = app.chemistry || ''
        baseData['考试一排名'] = app.classRank || ''
        baseData['考试一总人数'] = app.totalStudents || ''
        baseData['考试二名称'] = app.examName2 || ''
        baseData['考试二总分'] = app.totalScore2 || ''
        baseData['考试二语文'] = app.chinese2 || ''
        baseData['考试二数学'] = app.math2 || ''
        baseData['考试二英语'] = app.english2 || ''
        baseData['考试二物理'] = app.physics2 || ''
        baseData['考试二化学'] = app.chemistry2 || ''
        baseData['考试二排名'] = app.classRank2 || ''
        baseData['考试二总人数'] = app.totalStudents2 || ''
      }

      baseData['提交日期'] = app.submitDate
      baseData['审核状态'] = getStatusText(app.status)
      baseData['审核备注'] = app.notes || ''

      return baseData
    })

    // 创建工作簿
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '申请列表')

    // 设置列宽
    const colWidths = [
      { wch: 10 }, // 姓名
      { wch: 20 }, // 身份证号
      { wch: 6 },  // 性别
      { wch: 12 }, // 出生日期
      { wch: 25 }, // 邮箱
      { wch: 15 }, // 手机号
      { wch: 12 }, // 省份
      { wch: 12 }, // 城市
      { wch: 20 }, // 高中学校
      { wch: 10 }, // 家长姓名
      { wch: 15 }, // 家长电话
      { wch: 30 }, // 家庭地址
      { wch: 20 }, // 考试一名称
      { wch: 8 },  // 考试一总分
      { wch: 8 },  // 考试一语文
      { wch: 8 },  // 考试一数学
      { wch: 8 },  // 考试一英语
      { wch: 8 },  // 考试一物理
      { wch: 8 },  // 考试一化学
      { wch: 10 }, // 考试一排名
      { wch: 12 }, // 考试一总人数
      { wch: 20 }, // 考试二名称
      { wch: 8 },  // 考试二总分
      { wch: 8 },  // 考试二语文
      { wch: 8 },  // 考试二数学
      { wch: 8 },  // 考试二英语
      { wch: 8 },  // 考试二物理
      { wch: 8 },  // 考试二化学
      { wch: 10 }, // 考试二排名
      { wch: 12 }, // 考试二总人数
      { wch: 12 }, // 提交日期
      { wch: 10 }, // 审核状态
      { wch: 30 }  // 审核备注
    ]
    ws['!cols'] = colWidths

    // 导出文件
    const fileName = `奖学金申请列表_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  const handleExportSelected = () => {
    if (selectedIds.size === 0) {
      alert('请先选择要导出的申请')
      return
    }

    const selectedApps = applications.filter(app => selectedIds.has(app.id))
    const exportData = selectedApps.map(app => ({
      '奖学金类型': app.scholarshipType === 'subject' ? '学科特长' : '创新潜质',
      '姓名': app.name,
      '身份证号': app.idCard,
      '邮箱': app.email,
      '高中学校': app.school,
      '总分': app.totalScore || '',
      '年级排名': app.classRank || '',
      '提交日期': app.submitDate,
      '审核状态': getStatusText(app.status)
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '选中的申请')

    const fileName = `已选申请_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredApplications.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredApplications.map(app => app.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  // 归档单个申请（软删除，可恢复）
  const handleDelete = async (id: string) => {
    const app = applications.find(a => a.id === id)
    if (!app) return

    if (window.confirm(`确定要归档 ${app.name} 的申请吗？\n归档后申请会移到「已归档」中，可随时恢复。`)) {
      try {
        await applicationAPI.delete(parseInt(id))

        setApplications(applications.filter(app => app.id !== id))
        setSelectedIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
        alert('已归档！可在「已归档」标签查看与恢复')
      } catch (error) {
        console.error('归档失败:', error)
        alert('归档失败：' + (error as Error).message)
      }
    }
  }

  // 批量归档选中的申请
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) {
      alert('请先选择要归档的申请')
      return
    }

    if (window.confirm(`确定要归档选中的 ${selectedIds.size} 条申请吗？\n归档后可在「已归档」标签恢复。`)) {
      try {
        // 批量调用后端API删除
        const deletePromises = Array.from(selectedIds).map(id => 
          applicationAPI.delete(parseInt(id))
        )
        await Promise.all(deletePromises)
        
        // 删除成功后更新前端状态
        setApplications(applications.filter(app => !selectedIds.has(app.id)))
        setSelectedIds(new Set())
        alert('批量删除成功！')
      } catch (error) {
        console.error('批量删除失败:', error)
        alert('批量删除失败：' + (error as Error).message)
      }
    }
  }

  // 归档全部申请
  const handleDeleteAll = async () => {
    if (applications.length === 0) {
      alert('当前没有申请记录')
      return
    }

    const confirmText = `确定要归档全部 ${applications.length} 条申请记录吗？\n\n归档后可在「已归档」标签恢复或永久删除。`

    if (window.confirm(confirmText)) {
      if (window.confirm('请再次确认：真的要归档所有申请记录吗？')) {
        try {
          const deletePromises = applications.map(app =>
            applicationAPI.delete(parseInt(app.id))
          )
          await Promise.all(deletePromises)

          setApplications([])
          setSelectedIds(new Set())
          alert('已全部归档！')
        } catch (error) {
          console.error('归档全部失败:', error)
          alert('归档全部失败：' + (error as Error).message)
        }
      }
    }
  }

  const pendingCount = applications.filter(app => app.status === 'pending').length
  const approvedCount = applications.filter(app => app.status === 'approved').length
  const rejectedCount = applications.filter(app => app.status === 'rejected').length
  const totalCount = applications.length

  // 按学校统计
  const schoolStats = applications.reduce((acc, app) => {
    acc[app.school] = (acc[app.school] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topSchools = Object.entries(schoolStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <img
            src="/source/logo2.png"
            alt="广东以色列理工学院"
            className={styles.logo}
          />
          <h1 className={styles.title}>奖学金申请管理系统</h1>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.settingsBtn} 
            onClick={() => {
              setShowModifyRequests(true)
              loadModifyRequests()
            }}
            style={{ background: '#f59e0b', color: 'white' }}
          >
            ✏️ 修改请求 {modifyRequests.length > 0 && `(${modifyRequests.length})`}
          </button>
          <button className={styles.settingsBtn} onClick={() => setShowEmailSettings(true)}>
            ⚙️ 邮箱配置
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            退出登录
          </button>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>总申请数</div>
            <p className={styles.statValue}>{totalCount}</p>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>待审核</div>
            <p className={styles.statValue}>{pendingCount}</p>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>已通过</div>
            <p className={styles.statValue}>{approvedCount}</p>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>已拒绝</div>
            <p className={styles.statValue}>{rejectedCount}</p>
          </div>
        </div>

        {topSchools.length > 0 && (
          <div className={styles.schoolStats}>
            <h3 className={styles.schoolStatsTitle}>申请学校分布 TOP 5</h3>
            <div className={styles.schoolStatsGrid}>
              {topSchools.map(([school, count]) => (
                <div key={school} className={styles.schoolStatItem}>
                  <span className={styles.schoolName}>{school}</span>
                  <span className={styles.schoolCount}>{count} 人</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>{viewMode === 'archived' ? '已归档申请' : '申请列表'}</h2>
            <div className={styles.tableActions}>
              <div className={styles.filterGroup}>
                <button
                  className={viewMode === 'active' ? styles.filterBtnActive : styles.filterBtn}
                  onClick={() => switchViewMode('active')}
                  title="查看当前所有未归档的申请"
                >
                  📂 当前申请
                </button>
                <button
                  className={viewMode === 'archived' ? styles.filterBtnActive : styles.filterBtn}
                  onClick={() => switchViewMode('archived')}
                  title="查看已归档的申请，可恢复或永久删除"
                >
                  🗄️ 已归档
                </button>
              </div>
              <div className={styles.filterGroup}>
                <button
                  className={scholarshipTypeFilter === 'all' ? styles.filterBtnActive : styles.filterBtn}
                  onClick={() => setScholarshipTypeFilter('all')}
                >
                  全部
                </button>
                <button
                  className={scholarshipTypeFilter === 'subject' ? styles.filterBtnActive : styles.filterBtn}
                  onClick={() => setScholarshipTypeFilter('subject')}
                >
                  学科特长奖学金
                </button>
                <button
                  className={scholarshipTypeFilter === 'innovation' ? styles.filterBtnActive : styles.filterBtn}
                  onClick={() => setScholarshipTypeFilter('innovation')}
                >
                  创新潜质奖学金
                </button>
              </div>
              <input
                type="text"
                className={styles.searchBox}
                placeholder="搜索姓名、学校或邮箱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className={styles.exportBtn}
                onClick={reloadApplications}
                disabled={isRefreshing}
                style={{ background: '#0132b2', opacity: isRefreshing ? 0.6 : 1, cursor: isRefreshing ? 'not-allowed' : 'pointer' }}
                title="重新拉取最新申请数据"
              >
                {isRefreshing ? '🔄 刷新中...' : '🔄 刷新数据'}
              </button>
              <span style={{ fontSize: '12px', color: '#6b7280', alignSelf: 'center', whiteSpace: 'nowrap' }}>
                {lastRefreshTime ? `最后刷新：${lastRefreshTime}（共 ${applications.length} 条）` : '加载中...'}
              </span>
              {viewMode === 'active' && (
                <>
                  <button className={styles.exportBtn} onClick={handleExportExcel}>
                    📥 导出全部
                  </button>
                  {selectedIds.size > 0 && (
                    <>
                      <button className={styles.exportBtn} onClick={handleExportSelected}>
                        📥 导出已选 ({selectedIds.size})
                      </button>
                      <button className={styles.deleteBtn} onClick={handleDeleteSelected}>
                        📦 归档选中 ({selectedIds.size})
                      </button>
                    </>
                  )}
                  <button className={styles.deleteAllBtn} onClick={handleDeleteAll}>
                    📦 归档全部
                  </button>
                </>
              )}
            </div>
          </div>

          {filteredApplications.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredApplications.length && filteredApplications.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>姓名</th>
                  <th>身份证号</th>
                  <th>学校</th>
                  <th>奖学金类型</th>
                  <th>邮箱</th>
                  <th>提交日期</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(app.id)}
                        onChange={() => toggleSelect(app.id)}
                      />
                    </td>
                    <td>{app.name}</td>
                    <td>{app.idCard}</td>
                    <td>{app.school}</td>
                    <td>
                      <span className={app.scholarshipType === 'subject' ? styles.scholarshipSubject : styles.scholarshipInnovation}>
                        {app.scholarshipType === 'subject' ? '学科特长' : '创新潜质'}
                      </span>
                    </td>
                    <td>{app.email}</td>
                    <td>{app.submitDate}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(app.status)}`}>
                        {getStatusText(app.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleViewDetails(app.id)}
                      >
                        查看
                      </button>
                      {viewMode === 'active' ? (
                        <>
                          <button
                            className={styles.actionBtn}
                            onClick={() => handleSendEmail({ name: app.name, email: app.email })}
                          >
                            📧
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.deleteActionBtn}`}
                            onClick={() => handleDelete(app.id)}
                            title="归档（不删除数据，可恢复）"
                          >
                            📦
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className={styles.actionBtn}
                            onClick={() => handleRestore(app.id)}
                            title="恢复到当前申请列表"
                            style={{ background: '#10b981', color: '#fff' }}
                          >
                            ♻️ 恢复
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.deleteActionBtn}`}
                            onClick={() => handleForceDelete(app.id)}
                            title="永久删除（不可恢复）"
                          >
                            🗑️ 永久删除
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.emptyState}>
              <p>暂无申请记录</p>
            </div>
          )}
        </div>
      </div>

      {selectedApp && (
        <ApplicationDetail
          application={selectedApp}
          onClose={() => {
            setSelectedApp(null)
            setLoadDetailError(null)
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          isLoadingAttachments={isLoadingDetail}
          loadAttachmentsError={loadDetailError}
          onChangeScholarshipType={async (id, type) => {
            try {
              await applicationAPI.changeScholarshipType(parseInt(id), type)
              setApplications(prev => prev.map(a => a.id === id ? { ...a, scholarshipType: type } : a))
              setSelectedApp(prev => prev ? { ...prev, scholarshipType: type } : prev)
              alert(type === 'innovation' ? '已转为「创新潜质奖」' : '已转为「学科特长奖」')
            } catch (e) {
              alert('转换失败：' + (e as Error).message)
            }
          }}
        />
      )}

      {emailRecipient && (
        <EmailModal
          recipient={emailRecipient}
          onClose={() => setEmailRecipient(null)}
          onSend={handleEmailSend}
        />
      )}

      {showEmailSettings && (
        <EmailSettings
          onClose={() => setShowEmailSettings(false)}
        />
      )}

      {/* 修改请求弹窗 */}
      {showModifyRequests && (
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
          onClick={() => setShowModifyRequests(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '900px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, color: '#0132b2', fontSize: '24px' }}>✏️ 修改请求历史（共 {modifyRequests.length} 条）</h2>
              <button
                onClick={() => setShowModifyRequests(false)}
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

            {modifyRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <p style={{ fontSize: '16px' }}>暂无修改记录</p>
                <p style={{ fontSize: '13px', marginTop: '8px' }}>学生在「我的中心」提交修改申请后，会在此处永久留存审计记录</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {modifyRequests.map((request: any) => {
                  const isSubject = request.scholarship_type === 'subject'
                  return (
                    <div
                      key={request.history_id}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '20px',
                        background: '#f9fafb'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
                        <div>
                          <h3 style={{ margin: '0 0 8px', color: '#1f2937', fontSize: '18px' }}>
                            {request.name || '(未填写姓名)'} <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 'normal' }}>身份证：{request.student_id_card}</span>
                          </h3>
                          <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>
                            申请修改时间：{request.request_date || (request.created_at ? new Date(request.created_at).toLocaleString('zh-CN') : '-')}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{
                            padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                            background: isSubject ? '#fef3c7' : '#dbeafe',
                            color: isSubject ? '#92400e' : '#1e40af'
                          }}>
                            {isSubject ? '学科特长' : (request.scholarship_type === 'innovation' ? '创新潜质' : (request.scholarship_type || '未知类型'))}
                          </span>
                          {request.application_id && (
                            <button
                              onClick={() => {
                                setShowModifyRequests(false)
                                handleViewDetails(String(request.application_id))
                              }}
                              style={{ padding: '6px 12px', fontSize: '13px', background: '#0132b2', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              📄 查看对应申请
                            </button>
                          )}
                        </div>
                      </div>

                      <div style={{ background: 'white', padding: '16px', borderRadius: '6px', marginBottom: request.attachments && request.attachments.length > 0 ? '16px' : 0 }}>
                        <p style={{ margin: '0 0 8px', fontWeight: '600', color: '#1f2937' }}>修改理由：</p>
                        <p style={{ margin: 0, color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                          {request.reason || '(未填写)'}
                        </p>
                      </div>

                      {request.attachments && Array.isArray(request.attachments) && request.attachments.length > 0 && (
                        <div style={{ background: 'white', padding: '16px', borderRadius: '6px' }}>
                          <p style={{ margin: '0 0 12px', fontWeight: '600', color: '#1f2937' }}>佐证材料（{request.attachments.length} 个）：</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {request.attachments.map((file: any, index: number) => (
                              <HistoryAttachmentButton key={index} file={file} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard

