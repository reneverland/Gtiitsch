import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { pinyin } from 'pinyin-pro'
import Layout from '../components/Layout'
import Sidebar from '../components/Sidebar'
import { studentLogout } from '../components/StudentLoginModal'
import { getApplicationState, getScholarshipTypeName, getStatusText, getStatusColor, submitApplication, type ApplicationState } from '../store/applicationStore'
import { applicationAPI } from '../services/api'
import { getProvinces, getCitiesByProvince, getDistrictsByCity, getSchoolsByDistrict } from '../data/schools'
import styles from './StudentApplication.module.css'

// 竞赛获奖信息接口
interface CompetitionAward {
  id: string
  name: string
  issuer: string
  awardTime: string
  awardLevel: string
  isPublished: string
  publicLink: string
}

interface AttachmentFile {
  name: string
  type: string
  size: number
  dataUrl: string
}

interface FormData {
  // 个人信息
  name: string
  familyName: string
  givenName: string
  gender: string
  ethnicity: string
  birthDate: string
  idCard: string
  email: string
  school: string
  subjects: string
  
  // 高中学习经历
  highSchoolClass: string
  classTeacher: string
  classTeacherPhone: string
  schoolAddress: string
  schoolProvince: string
  schoolCity: string
  
  // 家庭信息
  parentName: string
  parentPhone: string
  parentWechat: string
  country: string
  province: string
  address: string
  zipCode: string
  
  // 高中成绩 - 考试一
  examName: string
  totalScore: string
  totalScoreMax: string
  chinese: string
  chineseMax: string
  math: string
  mathMax: string
  english: string
  englishMax: string
  physics: string
  physicsMax: string
  chemistry: string
  chemistryMax: string
  classRank: string
  totalStudents: string
  
  // 高中成绩 - 考试二
  examName2: string
  totalScore2: string
  totalScoreMax2: string
  chinese2: string
  chineseMax2: string
  math2: string
  mathMax2: string
  english2: string
  englishMax2: string
  physics2: string
  physicsMax2: string
  chemistry2: string
  chemistryMax2: string
  classRank2: string
  totalStudents2: string
}

// 中国56个民族列表
const ethnicities = [
  '汉族', '蒙古族', '回族', '藏族', '维吾尔族', '苗族', '彝族', '壮族',
  '布依族', '朝鲜族', '满族', '侗族', '瑶族', '白族', '土家族', '哈尼族',
  '哈萨克族', '傣族', '黎族', '傈僳族', '佤族', '畲族', '高山族', '拉祜族',
  '水族', '东乡族', '纳西族', '景颇族', '柯尔克孜族', '土族', '达斡尔族', '仫佬族',
  '羌族', '布朗族', '撒拉族', '毛南族', '仡佬族', '锡伯族', '阿昌族', '普米族',
  '塔吉克族', '怒族', '乌孜别克族', '俄罗斯族', '鄂温克族', '德昂族', '保安族', '裕固族',
  '京族', '塔塔尔族', '独龙族', '鄂伦春族', '赫哲族', '门巴族', '珞巴族', '基诺族'
]

// 中文姓氏拼音首字母映射（常见姓氏）
const surnameInitials: { [key: string]: string[] } = {
  'A': ['阿'],
  'B': ['白', '班', '包', '鲍', '毕', '卞', '边', '卜', '步'],
  'C': ['蔡', '曹', '岑', '柴', '常', '车', '陈', '成', '程', '迟', '池', '褚', '崔'],
  'D': ['戴', '邓', '刁', '丁', '董', '窦', '杜', '段', '端木'],
  'E': ['鄂'],
  'F': ['樊', '范', '方', '房', '费', '冯', '凤', '符', '傅', '富'],
  'G': ['甘', '高', '葛', '耿', '巩', '龚', '勾', '苟', '古', '谷', '顾', '关', '管', '桂', '郭', '国'],
  'H': ['海', '韩', '杭', '郝', '何', '贺', '赫', '衡', '洪', '侯', '胡', '花', '华', '滑', '怀', '欢', '桓', '黄', '惠', '霍'],
  'J': ['吉', '纪', '季', '贾', '简', '江', '姜', '蒋', '焦', '晋', '金', '靳', '井', '景', '居'],
  'K': ['阚', '康', '柯', '孔', '寇', '匡', '邝', '蒯', '况', '隗'],
  'L': ['赖', '蓝', '郎', '劳', '乐', '雷', '冷', '黎', '李', '理', '力', '利', '连', '廉', '梁', '廖', '林', '凌', '刘', '柳', '龙', '隆', '卢', '陆', '路', '娄', '鲁', '陇', '吕', '罗', '骆'],
  'M': ['马', '买', '麦', '满', '毛', '茅', '梅', '孟', '米', '苗', '闵', '明', '缪', '莫', '牟', '穆'],
  'N': ['南', '倪', '聂', '宁', '牛', '农'],
  'O': ['欧', '欧阳'],
  'P': ['潘', '庞', '裴', '彭', '皮', '平', '蒲', '浦', '濮'],
  'Q': ['戚', '齐', '祁', '钱', '强', '乔', '秦', '邱', '丘', '裘', '屈', '曲', '权'],
  'R': ['冉', '饶', '任', '芮', '阮', '汝'],
  'S': ['萨', '赛', '桑', '沙', '单', '商', '尚', '邵', '佘', '舍', '申', '沈', '盛', '师', '施', '石', '史', '寿', '舒', '帅', '双', '水', '司', '司马', '司徒', '宋', '苏', '孙'],
  'T': ['谭', '汤', '唐', '陶', '滕', '田', '佟', '童', '屠', '涂'],
  'W': ['万', '汪', '王', '危', '韦', '卫', '魏', '温', '文', '闻', '翁', '巫', '邬', '吴', '伍', '武', '吾'],
  'X': ['奚', '郗', '席', '习', '夏', '鲜', '冼', '相', '项', '肖', '萧', '谢', '辛', '邢', '幸', '熊', '徐', '许', '宣', '薛', '荀'],
  'Y': ['严', '颜', '言', '阎', '晏', '闫', '杨', '羊', '阳', '叶', '易', '殷', '尹', '银', '应', '雍', '尤', '游', '于', '余', '俞', '虞', '禹', '喻', '郁', '袁', '岳', '云'],
  'Z': ['臧', '曾', '查', '翟', '詹', '湛', '张', '章', '赵', '甄', '郑', '支', '钟', '仲', '周', '朱', '祝', '卓', '宗', '邹', '祖', '左']
}

// 获取中文字符的拼音首字母
const getChineseInitials = (chinese: string): string[] => {
  if (!chinese) return []
  const initials: string[] = []
  for (const char of chinese) {
    let found = false
    for (const [initial, chars] of Object.entries(surnameInitials)) {
      if (chars.includes(char)) {
        initials.push(initial)
        found = true
        break
      }
    }
    if (!found) {
      // 如果找不到，暂时不添加（或者可以添加'?'）
      initials.push('?')
    }
  }
  return initials
}

// 验证拼音是否匹配中文
const validatePinyinMatch = (chinese: string, pinyin: string): string => {
  if (!chinese || !pinyin) return ''
  
  const chineseInitials = getChineseInitials(chinese)
  const pinyinInitial = pinyin.charAt(0).toUpperCase()
  
  // 如果中文字符有未知的拼音（?），则不进行验证
  if (chineseInitials.includes('?')) {
    return ''
  }
  
  // 检查拼音首字母是否在可能的拼音首字母中
  if (!chineseInitials.includes(pinyinInitial)) {
    const expectedInitials = chineseInitials.join('/')
    return `⚠️ 提醒："${chinese}"的拼音首字母通常是 ${expectedInitials}，请检查是否输入正确`
  }
  
  return ''
}

const StudentApplication: React.FC = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [appState, setAppState] = useState<ApplicationState>({
    status: 'not_submitted',
    isLocked: false
  })
  const [showStatusBar, setShowStatusBar] = useState(true)
  const [isAgreed, setIsAgreed] = useState(false)
  
  // 记录用户到达过的最大步骤，用于控制导航
  const [maxReachedStep, setMaxReachedStep] = useState(0)
  
  // 获取奖学金类型
  const scholarshipType = localStorage.getItem('scholarshipType') as 'subject' | 'innovation' || 'innovation'
  
  // 根据奖学金类型动态生成步骤
  const getSteps = () => {
    const baseSteps = [
      { id: 0, title: '申请须知' },
      { id: 1, title: '个人基本信息' },
      { id: 2, title: '家庭基本信息' },
      { id: 3, title: '高中学习经历' },
    ]
    
    if (scholarshipType === 'subject') {
      // 学科特长：跳过成绩，保留竞赛
      return [
        ...baseSteps,
        { id: 4, title: '竞赛获奖信息' },
        { id: 5, title: '上传报名材料' },
        { id: 6, title: '报名信息预览' },
      ]
    } else {
      // 创新潜质：保留成绩，跳过竞赛
      return [
        ...baseSteps,
        { id: 4, title: '高中学习成绩' },
        { id: 5, title: '上传报名材料' },
        { id: 6, title: '报名信息预览' },
      ]
    }
  }
  
  const steps = getSteps()
  
  // 表单验证错误状态
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  
  // 获取当前登录用户信息
  const studentIdCard = localStorage.getItem('studentIdCard') || '未登录'
  const registeredUser = localStorage.getItem('registeredUser')
  let studentName = '学生'
  if (registeredUser) {
    try {
      const user = JSON.parse(registeredUser)
      studentName = user.fullName || '学生'
    } catch (e) {
      // 解析失败，使用默认值
    }
  }
  
  // 文件转Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
  
  // 处理文件上传
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>, 
    type: 'idCard' | 'scoreSheet' | 'competition' | 'other'
  ) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    
    setUploadingFile(type)
    
    try {
      const file = files[0]
      
      // 文件大小验证（10MB）
      if (file.size > 10 * 1024 * 1024) {
        alert('文件大小不能超过10MB')
        return
      }
      
      // 文件类型验证
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (!validTypes.includes(file.type)) {
        alert('只支持 PDF、JPG、PNG 格式的文件')
        return
      }
      
      const dataUrl = await fileToBase64(file)
      const attachmentData: AttachmentFile = {
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl
      }
      
      // 根据类型保存附件
      switch (type) {
        case 'idCard':
          setIdCardAttachment(attachmentData)
          break
        case 'scoreSheet':
          setScoreSheetAttachment(attachmentData)
          break
        case 'competition':
          // 多文件上传
          const competitionFiles: AttachmentFile[] = []
          const competitionSkipped: string[] = []
          for (let i = 0; i < files.length; i++) {
            const f = files[i]
            if (f.size > 10 * 1024 * 1024) {
              competitionSkipped.push(`「${f.name}」超过10MB`)
              continue
            }
            if (!validTypes.includes(f.type)) {
              competitionSkipped.push(`「${f.name}」格式不支持`)
              continue
            }
            const url = await fileToBase64(f)
            competitionFiles.push({
              name: f.name,
              type: f.type,
              size: f.size,
              dataUrl: url
            })
          }
          if (competitionSkipped.length > 0) {
            alert('以下文件已跳过：\n' + competitionSkipped.join('\n'))
          }
          setCompetitionAttachments([...competitionAttachments, ...competitionFiles])
          break
        case 'other':
          // 多文件上传
          const otherFiles: AttachmentFile[] = []
          const otherSkipped: string[] = []
          for (let i = 0; i < files.length; i++) {
            const f = files[i]
            if (f.size > 10 * 1024 * 1024) {
              otherSkipped.push(`「${f.name}」超过10MB`)
              continue
            }
            if (!validTypes.includes(f.type)) {
              otherSkipped.push(`「${f.name}」格式不支持`)
              continue
            }
            const url = await fileToBase64(f)
            otherFiles.push({
              name: f.name,
              type: f.type,
              size: f.size,
              dataUrl: url
            })
          }
          if (otherSkipped.length > 0) {
            alert('以下文件已跳过：\n' + otherSkipped.join('\n'))
          }
          setOtherAttachments([...otherAttachments, ...otherFiles])
          break
      }
      
      alert('✅ 文件上传成功！')
    } catch (error) {
      console.error('文件上传失败:', error)
      alert('❌ 文件上传失败，请重试')
    } finally {
      setUploadingFile(null)
      // 清空input，允许重复上传同一文件
      event.target.value = ''
    }
  }
  
  // 删除附件
  const handleDeleteAttachment = (type: 'idCard' | 'scoreSheet' | 'competition' | 'other', index?: number) => {
    if (!window.confirm('确定要删除这个附件吗？')) return
    
    switch (type) {
      case 'idCard':
        setIdCardAttachment(null)
        break
      case 'scoreSheet':
        setScoreSheetAttachment(null)
        break
      case 'competition':
        if (index !== undefined) {
          setCompetitionAttachments(competitionAttachments.filter((_, i) => i !== index))
        }
        break
      case 'other':
        if (index !== undefined) {
          setOtherAttachments(otherAttachments.filter((_, i) => i !== index))
        }
        break
    }
  }
  
  // 预览附件
  const handlePreviewAttachment = (dataUrl: string) => {
    setPreviewImage(dataUrl)
  }
  
  // 验证当前步骤的必填项
  const validateCurrentStep = (): { valid: boolean; message: string; fieldId?: string } => {
    switch (currentStep) {
      case 0: // 申请须知
        if (!isAgreed) {
          return { valid: false, message: '请勾选确认已阅读申请须知' }
        }
        return { valid: true, message: '' }
        
      case 1: // 个人基本信息
        const step1Required = [
          { field: 'name', label: '姓名', value: formData.name },
          { field: 'familyName', label: '姓（拼音）', value: formData.familyName },
          { field: 'givenName', label: '名字（拼音）', value: formData.givenName },
          { field: 'gender', label: '性别', value: formData.gender },
          { field: 'ethnicity', label: '民族', value: formData.ethnicity },
          { field: 'birthDate', label: '出生日期', value: formData.birthDate },
          { field: 'idCard', label: '身份证号码', value: formData.idCard },
          { field: 'email', label: '申请人邮箱', value: formData.email },
          { field: 'subjects', label: '选考科目', value: formData.subjects }
        ]
        
        for (const item of step1Required) {
          if (!item.value || item.value.trim() === '') {
            return { valid: false, message: `请填写"${item.label}"`, fieldId: item.field }
          }
        }
        
        if (formData.subjects === '其他组合') {
          return { valid: false, message: '2026年报考广以的考生须选考物理+化学，请修改选考科目。', fieldId: 'subjects' }
        }
        
        // 检查验证错误
        if (Object.keys(errors).length > 0) {
          const firstError = Object.keys(errors)[0]
          return { valid: false, message: `请修正"${errors[firstError]}"`, fieldId: firstError }
        }
        return { valid: true, message: '' }
        
      case 2: // 家庭基本信息
        const step2Required = [
          { field: 'parentName', label: '家长姓名', value: formData.parentName },
          { field: 'parentPhone', label: '手机', value: formData.parentPhone },
          { field: 'parentWechat', label: '微信', value: formData.parentWechat },
          { field: 'province', label: '省份/直辖市/自治区', value: formData.province },
          { field: 'address', label: '详细地址', value: formData.address }
        ]
        
        for (const item of step2Required) {
          if (!item.value || item.value.trim() === '') {
            return { valid: false, message: `请填写"${item.label}"`, fieldId: item.field }
          }
        }
        return { valid: true, message: '' }
        
      case 3: // 高中学习经历
        const step3Required = [
          { field: 'school', label: '学校', value: formData.school },
          { field: 'classTeacher', label: '班主任姓名', value: formData.classTeacher },
          { field: 'classTeacherPhone', label: '班主任电话', value: formData.classTeacherPhone }
        ]
        
        for (const item of step3Required) {
          if (!item.value || item.value.trim() === '') {
            return { valid: false, message: `请填写"${item.label}"`, fieldId: item.field }
          }
        }
        return { valid: true, message: '' }
        
      case 4: // 竞赛获奖或高中成绩
        if (scholarshipType === 'subject') {
          // 学科特长奖学金需要填写竞赛
          if (competitionAwards.length === 0) {
            return { valid: false, message: '学科特长奖学金至少需要填写一项竞赛获奖信息' }
          }
          // 检查每个竞赛的必填项
          for (let i = 0; i < competitionAwards.length; i++) {
            const award = competitionAwards[i]
            if (!award.name) return { valid: false, message: `竞赛${i + 1}：请填写竞赛名称` }
            if (!award.issuer) return { valid: false, message: `竞赛${i + 1}：请填写证书颁发单位` }
            if (!award.awardTime) return { valid: false, message: `竞赛${i + 1}：请填写获奖时间` }
            if (!award.awardLevel) return { valid: false, message: `竞赛${i + 1}：请填写获奖等级` }
          }
        }
        // 创新潜质奖学金：取消高中成绩必填验证
        // 学生可以选择使用学校成绩单，直接跳到下一步上传附件
        return { valid: true, message: '' }
        
      case 5: // 上传报名材料
        if (!idCardAttachment) {
          return { valid: false, message: '请上传身份证扫描件（必填）' }
        }
        
        // 根据奖学金类型验证不同的附件
        if (scholarshipType === 'subject') {
          // 学科特长奖学金：需要竞赛证书，不需要成绩单
          if (competitionAttachments.length === 0) {
            return { valid: false, message: '请上传竞赛获奖证书（必填）' }
          }
        } else {
          // 创新潜质奖学金：需要成绩单，不需要竞赛证书
          if (!scoreSheetAttachment) {
            return { valid: false, message: '请上传高中成绩表（必填）' }
          }
        }
        
        return { valid: true, message: '' }
        
      default:
        return { valid: true, message: '' }
    }
  }
  
  // 滚动到指定字段
  const scrollToField = (fieldId: string) => {
    setTimeout(() => {
      const element = document.querySelector(`[name="${fieldId}"]`) as HTMLElement ||
                     document.querySelector(`#${fieldId}`) as HTMLElement ||
                     document.querySelector(`input[value="${fieldId}"]`) as HTMLElement
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.focus()
        // 高亮显示
        element.style.outline = '2px solid #ef4444'
        element.style.outlineOffset = '2px'
        setTimeout(() => {
          element.style.outline = ''
          element.style.outlineOffset = ''
        }, 2000)
      }
    }, 100)
  }
  
  // 保存申请进度
  const handleSaveProgress = () => {
    // 保存表单数据到 localStorage
    localStorage.setItem('applicationFormData', JSON.stringify(formData))
    localStorage.setItem('applicationCurrentStep', currentStep.toString())
    localStorage.setItem('applicationMaxStep', maxReachedStep.toString())
    localStorage.setItem('applicationSavedTime', new Date().toLocaleString('zh-CN'))
    localStorage.setItem('scholarshipType', scholarshipType)
    
    // 保存竞赛获奖
    localStorage.setItem('competitionAwards', JSON.stringify(competitionAwards))
    
    // 保存附件
    localStorage.setItem('idCardAttachment', JSON.stringify(idCardAttachment))
    localStorage.setItem('scoreSheetAttachment', JSON.stringify(scoreSheetAttachment))
    localStorage.setItem('competitionAttachments', JSON.stringify(competitionAttachments))
    localStorage.setItem('otherAttachments', JSON.stringify(otherAttachments))
    
    alert('✅ 进度已保存！\n\n您可以随时返回继续填写。')
  }
  
  // 处理返回首页
  const handleGoHome = () => {
    if (window.confirm('返回首页前，是否保存当前进度？')) {
      handleSaveProgress()
    }
    navigate('/my-dashboard')
  }
  
  // 处理登出
  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      studentLogout()
      alert('已退出登录')
      navigate('/')
    }
  }
  
  // 异步加载申请状态
  useEffect(() => {
    const loadApplicationState = async () => {
      try {
        const state = await getApplicationState()
        setAppState(state)
        
        // 如果申请被删除（状态为未提交且未锁定），清除可能残留的localStorage数据
        if (state.status === 'not_submitted' && !state.isLocked) {
          // 检查是否有残留的已提交标记，如果有则清除
          const savedData = localStorage.getItem('applicationFormData')
          if (savedData) {
            // 如果localStorage中有数据，但服务器说未提交，可能是被删除了
            console.log('检测到申请可能已被删除，已清除本地缓存')
          }
        }
      } catch (error) {
        console.error('加载申请状态失败:', error)
      }
    }
    
    loadApplicationState()
  }, [])

  // 组件加载时恢复保存的进度
  useEffect(() => {
    // 检查奖学金类型是否已选择
    if (!scholarshipType) {
      alert('请先选择要申请的奖学金类型')
      navigate('/')
      return
    }

    // 检查是否已提交其他类型的奖学金（互斥校验）
    if (appState.isLocked && appState.scholarshipType && appState.scholarshipType !== scholarshipType) {
      const conflictScholarshipName = getScholarshipTypeName(appState.scholarshipType)
      const targetScholarshipName = getScholarshipTypeName(scholarshipType)
      alert(`您已申请${conflictScholarshipName}，无法申请${targetScholarshipName}`)
      navigate('/')
      return
    }
    
    // 检查用户是否已确认阅读申请须知
    const savedAgreed = localStorage.getItem('applicationAgreed')
    if (savedAgreed === 'true') {
      setIsAgreed(true)
    } else {
      // 如果用户未确认阅读，强制停留在第0步，不能访问后续步骤
      setIsAgreed(false)
      setMaxReachedStep(0)
      setCurrentStep(0)
      return
    }
    
    // 根据申请状态决定是否恢复保存的数据
    if (appState.isLocked) {
      // 从服务器加载已提交的数据供预览
      const loadSubmittedData = async () => {
        try {
          const studentId = localStorage.getItem('studentIdCard')
          if (!studentId) return
          const resp = await applicationAPI.getMyApplication(studentId)
          if (resp.success && resp.application) {
            const app = resp.application
            setFormData({
              name: app.name || '',
              familyName: app.family_name || '',
              givenName: app.given_name || '',
              gender: app.gender || '',
              ethnicity: app.ethnicity || '',
              birthDate: app.birth_date || '',
              idCard: app.student_id_card || '',
              email: app.email || '',
              school: app.school || '',
              subjects: app.subjects || '',
              highSchoolClass: app.high_school_class || '',
              classTeacher: app.class_teacher || '',
              classTeacherPhone: app.class_teacher_phone || '',
              schoolAddress: app.school_address || '',
              schoolProvince: app.school_province || '',
              schoolCity: app.school_city || '',
              parentName: app.parent_name || '',
              parentPhone: app.parent_phone || '',
              parentWechat: app.parent_wechat || '',
              country: app.country || '中国',
              province: app.province || '',
              address: app.address || '',
              zipCode: app.zip_code || '',
              examName: app.exam_name || '',
              totalScore: app.total_score || '',
              totalScoreMax: app.total_score_max || '750',
              chinese: app.chinese || '',
              chineseMax: app.chinese_max || '150',
              math: app.math || '',
              mathMax: app.math_max || '150',
              english: app.english || '',
              englishMax: app.english_max || '150',
              physics: app.physics || '',
              physicsMax: app.physics_max || '100',
              chemistry: app.chemistry || '',
              chemistryMax: app.chemistry_max || '100',
              classRank: app.class_rank || '',
              totalStudents: app.total_students || '',
              examName2: app.exam_name2 || '',
              totalScore2: app.total_score2 || '',
              totalScoreMax2: app.total_score_max2 || '750',
              chinese2: app.chinese2 || '',
              chineseMax2: app.chinese_max2 || '150',
              math2: app.math2 || '',
              mathMax2: app.math_max2 || '150',
              english2: app.english2 || '',
              englishMax2: app.english_max2 || '150',
              physics2: app.physics2 || '',
              physicsMax2: app.physics_max2 || '100',
              chemistry2: app.chemistry2 || '',
              chemistryMax2: app.chemistry_max2 || '100',
              classRank2: app.class_rank2 || '',
              totalStudents2: app.total_students2 || '',
            })
            // 加载附件
            if (app.id_card_attachment) {
              try { setIdCardAttachment(JSON.parse(app.id_card_attachment)) } catch {}
            }
            if (app.score_sheet_attachment) {
              try { setScoreSheetAttachment(JSON.parse(app.score_sheet_attachment)) } catch {}
            }
            if (app.competition_attachments) {
              try {
                const parsed = typeof app.competition_attachments === 'string' ? JSON.parse(app.competition_attachments) : app.competition_attachments
                setCompetitionAttachments(Array.isArray(parsed) ? parsed : [])
              } catch {}
            }
            if (app.other_attachments) {
              try {
                const parsed = typeof app.other_attachments === 'string' ? JSON.parse(app.other_attachments) : app.other_attachments
                setOtherAttachments(Array.isArray(parsed) ? parsed : [])
              } catch {}
            }
            if (app.competition_awards) {
              try {
                const parsed = typeof app.competition_awards === 'string' ? JSON.parse(app.competition_awards) : app.competition_awards
                setCompetitionAwards(Array.isArray(parsed) ? parsed : [])
              } catch {}
            }
          }
        } catch (e) {
          console.error('加载已提交数据失败:', e)
        }
      }
      loadSubmittedData()
      setCurrentStep(steps.length - 1)
    } else {
      // 未提交状态，恢复保存的进度
      const savedData = localStorage.getItem('applicationFormData')
      const savedStep = localStorage.getItem('applicationCurrentStep')
      const savedMaxStep = localStorage.getItem('applicationMaxStep')
      const savedAwards = localStorage.getItem('competitionAwards')
      const savedIdCard = localStorage.getItem('idCardAttachment')
      const savedScoreSheet = localStorage.getItem('scoreSheetAttachment')
      const savedCompetition = localStorage.getItem('competitionAttachments')
      const savedOther = localStorage.getItem('otherAttachments')
      
      if (savedData) {
        try {
          setFormData(JSON.parse(savedData))
          if (savedStep) {
            const step = parseInt(savedStep)
            setCurrentStep(step)
            // 恢复最大步骤
            if (savedMaxStep) {
              setMaxReachedStep(Math.max(step, parseInt(savedMaxStep)))
            } else {
              setMaxReachedStep(step)
            }
          }
          if (savedAwards) {
            setCompetitionAwards(JSON.parse(savedAwards))
          }
          // 恢复附件
          if (savedIdCard) setIdCardAttachment(JSON.parse(savedIdCard))
          if (savedScoreSheet) setScoreSheetAttachment(JSON.parse(savedScoreSheet))
          if (savedCompetition) setCompetitionAttachments(JSON.parse(savedCompetition))
          if (savedOther) setOtherAttachments(JSON.parse(savedOther))
        } catch (e) {
          console.error('恢复保存数据失败:', e)
        }
      }
    }
  }, [navigate, scholarshipType, appState])
  
  // 高中学习经历的级联选择
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedSchool, setSelectedSchool] = useState('')
  const [manualSchoolInput, setManualSchoolInput] = useState('')
  
  // 竞赛获奖信息
  const [competitionAwards, setCompetitionAwards] = useState<CompetitionAward[]>([])
  
  // 附件上传状态
  const [idCardAttachment, setIdCardAttachment] = useState<AttachmentFile | null>(null)
  const [scoreSheetAttachment, setScoreSheetAttachment] = useState<AttachmentFile | null>(null)
  const [competitionAttachments, setCompetitionAttachments] = useState<AttachmentFile[]>([])
  const [otherAttachments, setOtherAttachments] = useState<AttachmentFile[]>([])
  const [uploadingFile, setUploadingFile] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [scoreSheetDownloaded, setScoreSheetDownloaded] = useState(() => {
    const idCard = localStorage.getItem('studentIdCard') || ''
    return localStorage.getItem(`scoreSheetDownloaded_${idCard}`) === 'true'
  })
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    familyName: '',
    givenName: '',
    gender: '',
    ethnicity: '',
    birthDate: '',
    idCard: '',
    email: '',
    school: '',
    subjects: '',
    highSchoolClass: '',
    classTeacher: '',
    classTeacherPhone: '',
    schoolAddress: '',
    schoolProvince: '',
    schoolCity: '',
    parentName: '',
    parentPhone: '',
    parentWechat: '',
    country: '中国',
    province: '',
    address: '',
    zipCode: '',
    examName: '',
    totalScore: '',
    totalScoreMax: '750',
    chinese: '',
    chineseMax: '150',
    math: '',
    mathMax: '150',
    english: '',
    englishMax: '150',
    physics: '',
    physicsMax: '100',
    chemistry: '',
    chemistryMax: '100',
    classRank: '',
    totalStudents: '',
    examName2: '',
    totalScore2: '',
    totalScoreMax2: '750',
    chinese2: '',
    chineseMax2: '150',
    math2: '',
    mathMax2: '150',
    english2: '',
    englishMax2: '150',
    physics2: '',
    physicsMax2: '100',
    chemistry2: '',
    chemistryMax2: '100',
    classRank2: '',
    totalStudents2: '',
  })

  // 验证函数
  const validateChineseName = (name: string): string => {
    if (!name) return ''
    const chineseNameRegex = /^[\u4e00-\u9fa5·]{2,10}$/
    if (!chineseNameRegex.test(name)) {
      return '请输入2-10个汉字，可包含"·"'
    }
    return ''
  }
  
  const validatePinyinName = (name: string): string => {
    if (!name) return ''
    const pinyinRegex = /^[A-Z]+$/
    if (!pinyinRegex.test(name)) {
      return '请输入大写英文字母'
    }
    return ''
  }
  
  const validateIdCard = (idCard: string): string => {
    if (!idCard) return ''
    if (idCard.length !== 18) {
      return '身份证号码必须为18位'
    }
    const idCardRegex = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9Xx]$/
    if (!idCardRegex.test(idCard)) {
      return '身份证号码格式不正确'
    }
    return ''
  }
  
  const validatePhone = (phone: string): string => {
    if (!phone) return ''
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      return '请输入正确的11位手机号码'
    }
    return ''
  }
  
  const validateEmail = (email: string): string => {
    if (!email) return ''
    // 基本邮箱格式验证
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      return '请输入正确的邮箱格式'
    }
    // 常见邮箱后缀校验
    const commonEmailDomains = [
      '@qq.com', '@163.com', '@126.com', '@gmail.com', 
      '@hotmail.com', '@outlook.com', '@sina.com', '@sina.cn',
      '@sohu.com', '@139.com', '@189.cn', '@yeah.net',
      '@foxmail.com', '@aliyun.com', '@vip.qq.com'
    ]
    const emailLower = email.toLowerCase()
    const hasCommonDomain = commonEmailDomains.some(domain => emailLower.endsWith(domain))
    if (!hasCommonDomain) {
      return '⚠️ 提醒：建议使用常见邮箱（如QQ、163、126、Gmail、Hotmail、Outlook等）'
    }
    return ''
  }
  
  const scoreFields: (keyof FormData)[] = [
    'examName', 'totalScore', 'totalScoreMax', 'chinese', 'chineseMax',
    'math', 'mathMax', 'english', 'englishMax', 'physics', 'physicsMax',
    'chemistry', 'chemistryMax', 'classRank', 'totalStudents',
    'examName2', 'totalScore2', 'totalScoreMax2', 'chinese2', 'chineseMax2',
    'math2', 'mathMax2', 'english2', 'englishMax2', 'physics2', 'physicsMax2',
    'chemistry2', 'chemistryMax2', 'classRank2', 'totalStudents2',
  ]

  const handleChange = (field: keyof FormData, value: string) => {
    if (scoreSheetDownloaded && scoreFields.includes(field)) {
      return
    }
    
    const newFormData = { ...formData, [field]: value }
    
    // 中文姓名自动生成拼音
    if (field === 'name' && value) {
      const chineseNameRegex = /^[\u4e00-\u9fa5·]{2,10}$/
      if (chineseNameRegex.test(value)) {
        const familyChar = value.charAt(0)
        const givenChars = value.substring(1)
        const familyPinyin = pinyin(familyChar, { toneType: 'none', type: 'array' }).join('').toUpperCase()
        const givenPinyin = pinyin(givenChars, { toneType: 'none', type: 'array' }).join('').toUpperCase()
        newFormData.familyName = familyPinyin
        newFormData.givenName = givenPinyin
      }
    }
    
    // 身份证号自动提取出生日期
    if (field === 'idCard' && value.length === 18) {
      const idCardRegex = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9Xx]$/
      if (idCardRegex.test(value)) {
        const year = value.substring(6, 10)
        const month = value.substring(10, 12)
        const day = value.substring(12, 14)
        newFormData.birthDate = `${year}-${month}-${day}`
      }
    }
    
    setFormData(newFormData)
    
    // 实时验证
    let error = ''
    switch (field) {
      case 'name':
        error = validateChineseName(value)
        break
      case 'familyName':
        error = validatePinyinName(value)
        if (!error && value && newFormData.name) {
          const firstName = newFormData.name.charAt(0)
          const pinyinWarning = validatePinyinMatch(firstName, value)
          if (pinyinWarning) {
            error = pinyinWarning
          }
        }
        break
      case 'givenName':
        error = validatePinyinName(value)
        if (!error && value && newFormData.name && newFormData.name.length > 1) {
          const givenName = newFormData.name.substring(1)
          const pinyinWarning = validatePinyinMatch(givenName, value)
          if (pinyinWarning) {
            error = pinyinWarning
          }
        }
        break
      case 'idCard':
        error = validateIdCard(value)
        break
      case 'email':
        error = validateEmail(value)
        break
      case 'parentPhone':
      case 'classTeacherPhone':
        error = validatePhone(value)
        break
      case 'parentName':
      case 'classTeacher':
        error = validateChineseName(value)
        break
    }
    
    if (error) {
      setErrors({ ...errors, [field]: error })
    } else {
      const newErrors = { ...errors }
      delete newErrors[field]
      setErrors(newErrors)
    }
  }
  
  // 添加竞赛获奖信息
  const handleAddCompetition = () => {
    const newAward: CompetitionAward = {
      id: Date.now().toString(),
      name: '',
      issuer: '',
      awardTime: '',
      awardLevel: '',
      isPublished: '',
      publicLink: ''
    }
    setCompetitionAwards([...competitionAwards, newAward])
  }
  
  // 删除竞赛获奖信息
  const handleRemoveCompetition = (id: string) => {
    setCompetitionAwards(competitionAwards.filter(award => award.id !== id))
  }
  
  // 更新竞赛获奖信息
  const handleCompetitionChange = (id: string, field: keyof CompetitionAward, value: string) => {
    setCompetitionAwards(competitionAwards.map(award =>
      award.id === id ? { ...award, [field]: value } : award
    ))
  }

  const handleNext = () => {
    // 验证当前步骤
    const validation = validateCurrentStep()
    if (!validation.valid) {
      alert('⚠️ ' + validation.message)
      if (validation.fieldId) {
        scrollToField(validation.fieldId)
      }
      return
    }
    
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      // 更新最大到达步骤
      if (nextStep > maxReachedStep) {
        setMaxReachedStep(nextStep)
        localStorage.setItem('applicationMaxStep', nextStep.toString())
      }
      // 如果是从第0步（申请须知）点击下一步，保存已确认阅读的状态
      if (currentStep === 0 && isAgreed) {
        localStorage.setItem('applicationAgreed', 'true')
      }
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (stepId: number) => {
    // 如果已提交锁定，不允许修改
    const lastStepId = steps.length - 1
    if (appState.isLocked && stepId !== lastStepId) {
      alert('申请已提交，无法修改。如需修改请联系管理员。')
      return
    }
    
    // 限制只能跳转到已到达的步骤
    if (stepId > maxReachedStep) {
      return
    }
    
    setCurrentStep(stepId)
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  // 提交申请
  const handleSubmitApplication = async () => {
    // 检查必填附件
    if (!idCardAttachment) {
      alert('请上传身份证扫描件（必填）')
      return
    }
    
    // 根据奖学金类型验证不同的附件
    if (scholarshipType === 'subject') {
      // 学科特长奖学金：需要竞赛证书
      if (competitionAttachments.length === 0) {
        alert('请上传竞赛获奖证书（必填）')
        return
      }
    } else {
      // 创新潜质奖学金：需要成绩单
      if (!scoreSheetAttachment) {
        alert('请上传高中成绩表（必填）')
        return
      }
    }
    
    if (!window.confirm('提交后将无法修改，确认提交吗？')) {
      return
    }
    
    try {
      // 提交申请，同时传入表单数据、竞赛数据和附件数据
      const newState = await submitApplication(
        scholarshipType, 
        formData, 
        competitionAwards,
        {
          idCard: idCardAttachment,
          scoreSheet: scoreSheetAttachment,
          competition: competitionAttachments,
          other: otherAttachments
        }
      )
      setAppState(newState)
      alert('申请已提交！6月中旬后可查看入围结果。')
      setCurrentStep(steps.length - 1) // 跳转到预览页面
      
      // 清除本地缓存的表单数据
      localStorage.removeItem('applicationFormData')
      localStorage.removeItem('applicationCurrentStep')
      localStorage.removeItem('applicationMaxStep')
      localStorage.removeItem('competitionAwards')
      localStorage.removeItem('idCardAttachment')
      localStorage.removeItem('scoreSheetAttachment')
      localStorage.removeItem('competitionAttachments')
      localStorage.removeItem('otherAttachments')
    } catch (error) {
      alert('提交失败：' + (error as Error).message + '\n请检查网络连接或联系管理员。')
      console.error('提交申请失败:', error)
    }
  }
  
  // 下载成绩单（HTML打印方式，支持中文）
  const handleDownloadScoreSheet = () => {
    if (!window.confirm('成绩单导出后，所填写的高三成绩将不可更改，请再次确认所填成绩无误。确定下载吗？')) {
      return
    }
    
    setScoreSheetDownloaded(true)
    localStorage.setItem(`scoreSheetDownloaded_${studentIdCard}`, 'true')
    
    try {
      // 创建打印窗口
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        alert('请允许浏览器弹出窗口以打印成绩单')
        return
      }
      
      // 生成HTML内容
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>2026创新潜质奖学金申请者高中成绩表（个人申报）</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 15mm;
    }
    body {
      font-family: "SimSun", "宋体", serif;
      margin: 0;
      padding: 20px;
    }
    .title {
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    th, td {
      border: 1px solid #000;
      padding: 8px;
      text-align: center;
      font-size: 12px;
    }
    .label {
      font-weight: bold;
      background-color: #f5f5f5;
    }
    .section-title {
      font-size: 14px;
      font-weight: bold;
      margin: 15px 0 10px 0;
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
    }
    .note {
      margin-top: 30px;
      font-size: 11px;
      color: #666;
    }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="title">2026创新潜质奖学金申请者高中成绩表（个人申报）</div>
  
  <table>
    <thead>
      <tr>
        <th colspan="8" class="label">基本信息</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="label">省份</td>
        <td>${formData.province || ''}</td>
        <td class="label">学生姓名</td>
        <td>${formData.name || ''}</td>
        <td class="label">联系电话</td>
        <td>${formData.parentPhone || ''}</td>
        <td class="label">学生身份证号</td>
        <td>${formData.idCard || ''}</td>
      </tr>
      <tr>
        <td class="label">就读中学</td>
        <td colspan="2">${formData.school || ''}</td>
        <td class="label">科类</td>
        <td>${formData.subjects === '物理+化学' ? '理科' : '文科'}</td>
        <td class="label">中学详细地址</td>
        <td colspan="2">${formData.schoolAddress || ''}</td>
      </tr>
    </tbody>
  </table>
  
  <div class="section-title">高三成绩</div>
  
  <table>
    <thead>
      <tr>
        <th>考试名称</th>
        <th>语文</th>
        <th>数学</th>
        <th>外语</th>
        <th>物理</th>
        <th>化学</th>
        <th>生物</th>
        <th>政治</th>
        <th>历史</th>
        <th>地理</th>
        <th>信息科技</th>
        <th>文理综合</th>
        <th>总分</th>
        <th>年级排名</th>
        <th>全年级总人数</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${formData.examName || ''}</td>
        <td>${formData.chinese && formData.chineseMax ? formData.chinese + '/' + formData.chineseMax : (formData.chinese || '')}</td>
        <td>${formData.math && formData.mathMax ? formData.math + '/' + formData.mathMax : (formData.math || '')}</td>
        <td>${formData.english && formData.englishMax ? formData.english + '/' + formData.englishMax : (formData.english || '')}</td>
        <td>${formData.physics && formData.physicsMax ? formData.physics + '/' + formData.physicsMax : (formData.physics || '')}</td>
        <td>${formData.chemistry && formData.chemistryMax ? formData.chemistry + '/' + formData.chemistryMax : (formData.chemistry || '')}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>${formData.totalScore && formData.totalScoreMax ? formData.totalScore + '/' + formData.totalScoreMax : (formData.totalScore || '')}</td>
        <td>${formData.classRank || ''}</td>
        <td>${formData.totalStudents || ''}</td>
      </tr>
      <tr>
        <td>${formData.examName2 || ''}</td>
        <td>${formData.chinese2 && formData.chineseMax2 ? formData.chinese2 + '/' + formData.chineseMax2 : (formData.chinese2 || '')}</td>
        <td>${formData.math2 && formData.mathMax2 ? formData.math2 + '/' + formData.mathMax2 : (formData.math2 || '')}</td>
        <td>${formData.english2 && formData.englishMax2 ? formData.english2 + '/' + formData.englishMax2 : (formData.english2 || '')}</td>
        <td>${formData.physics2 && formData.physicsMax2 ? formData.physics2 + '/' + formData.physicsMax2 : (formData.physics2 || '')}</td>
        <td>${formData.chemistry2 && formData.chemistryMax2 ? formData.chemistry2 + '/' + formData.chemistryMax2 : (formData.chemistry2 || '')}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>${formData.totalScore2 && formData.totalScoreMax2 ? formData.totalScore2 + '/' + formData.totalScoreMax2 : (formData.totalScore2 || '')}</td>
        <td>${formData.classRank2 || ''}</td>
        <td>${formData.totalStudents2 || ''}</td>
      </tr>
      <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
      <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
      <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
      <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
      <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
    </tbody>
  </table>
  
  <div class="footer">
    <p>中学确认以上所填内容真实有效</p>
    <p>中学审核人签字：__________________</p>
    <p style="text-align: right; margin-top: -40px;">中学公章（盖章）</p>
  </div>
  
  <div class="note">
    *此成绩表为广东以色列理工学院奖学金申请专用，请务必加盖公章后以图片格式上传！
  </div>
  
  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>
      `
      
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      alert('成绩单打印窗口已打开！请在打印预览中选择"另存为PDF"或直接打印。打印后请加盖学校公章，然后扫描上传至"上传报名材料"步骤。')
    } catch (error) {
      console.error('PDF生成失败:', error)
      alert('成绩单生成失败，请稍后重试。错误信息：' + (error as Error).message)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0: {
        const isSubject = scholarshipType === 'subject'
        return (
          <div className={styles.contentInner}>
            <h3 className={styles.contentTitle}>
              {isSubject ? '2026年学科特长奖学金申请系统' : '2026年创新潜质奖学金申请系统'}
            </h3>

            <div className={styles.welcomeSection}>
              <p className={styles.welcomeText}>亲爱的同学：</p>
              <p className={styles.welcomeText} style={{ textIndent: '2em', marginTop: '16px' }}>
                {isSubject
                  ? '欢迎您申请广东以色列理工学院学科特长奖学金！'
                  : '欢迎您申请广东以色列理工学院创新潜质奖学金！'}
              </p>
              <p className={styles.welcomeText} style={{ textIndent: '2em', marginTop: '12px' }}>
                请您如实填写申请表单，确保所有提交内容及材料需真实有效。我校承诺严格保护您的个人信息，不会以任何形式向第三方泄露。
              </p>
              <p className={styles.welcomeText} style={{ textIndent: '2em', marginTop: '12px' }}>
                {isSubject
                  ? '学生凭高中阶段获得的全国中学生奥林匹克竞赛（数学、物理、化学、生物、信息学）省级三等奖及以上获奖信息申请学科特长奖学金。'
                  : '学生凭高三年级2次模考成绩及排名申请创新潜质奖学金。'}
              </p>
            </div>

            <div className={styles.guideSection}>
              <h4>一、申请条件与材料</h4>
              {isSubject ? (
                <>
                  <p style={{ marginTop: '12px' }}>
                    <strong>申请条件：</strong>高中阶段获得全国中学生奥林匹克竞赛（数学、物理、化学、生物、信息学）省级三等奖及以上，并经过全国青少年科技竞赛获奖公示（
                    <a href="http://gs.cyscc.org/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-dark)', textDecoration: 'underline' }}>http://gs.cyscc.org/</a>
                    ）的高三学生。
                  </p>
                  <p style={{ marginTop: '12px' }}>
                    <strong>申请材料：</strong>学生本人身份证扫描件（正反面）；奥赛获奖证书扫描件及公示链接。
                  </p>
                </>
              ) : (
                <>
                  <p style={{ marginTop: '12px' }}>为确保申请顺利，请仔细阅读以下内容：</p>
                  <ol>
                    <li>
                      <a
                        href="/source/广东以色列理工学院2026年创新潜质奖学金个人申请指南.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--primary-dark)', textDecoration: 'underline' }}
                      >
                        《广东以色列理工学院2026年创新潜质奖学金实施办法》
                      </a>
                    </li>
                    <li>
                      <a
                        href="/source/广东以色列理工学院2026年创新潜质奖学金常见问题及解答.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--primary-dark)', textDecoration: 'underline' }}
                      >
                        《广东以色列理工学院2026年创新潜质奖学金常见问答》
                      </a>
                    </li>
                  </ol>
                  <div className={styles.downloadSection}>
                    <p style={{ fontWeight: '500', marginBottom: '8px' }}>下载模板：</p>
                    <a
                      href="/source/附件：2026年创新潜质奖学金高中成绩表模板（个人申请）.xlsx"
                      className={styles.downloadLink}
                      download
                    >
                      📄 个人申请成绩单模板：点击此处获取
                    </a>
                  </div>
                </>
              )}
            </div>

            <div className={styles.guideSection}>
              <h4>二、申请流程与时间安排</h4>
              <p style={{ marginTop: '12px' }}>
                点击下方"开始填写申请表"，根据系统提示填写并提交完整的申请材料。
              </p>
              <div className={styles.highlightBar} style={{ marginTop: '16px' }}>
                <p style={{ margin: '0 0 8px' }}><strong>申请截止日期：</strong>{isSubject ? '2026年7月5日23时59分' : '2026年5月31日23时59分'}</p>
                <p style={{ margin: '0 0 8px' }}><strong>结果公布日期：</strong>{isSubject ? '2026年6月中旬起逐批公布' : '2026年6月中旬'}</p>
                <p style={{ margin: '0' }}>
                  <strong>结果查询入口：</strong>
                  <a 
                    href="/my-dashboard" 
                    onClick={(e) => { e.preventDefault(); navigate('/my-dashboard') }}
                    style={{ color: 'var(--primary-dark)', marginLeft: '8px', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    点击此处查询
                  </a>
                </p>
              </div>
            </div>

            <div className={styles.guideSection}>
              <h4>三、联系方式</h4>
              <p style={{ marginTop: '12px' }}>
                <strong>联系电话：</strong>0754-88077077
              </p>
              <p style={{ marginTop: '8px' }}>
                <strong>联系邮箱：</strong>
                <a 
                  href="mailto:sci-scholarship@gtiit.edu.cn" 
                  style={{ color: 'var(--primary-dark)', textDecoration: 'underline' }}
                >
                  sci-scholarship@gtiit.edu.cn
                </a>
              </p>
              <p style={{ marginTop: '8px' }}>
                <strong>各省招生老师联系方式：</strong>
                <a 
                  href="https://sites.gtiit.edu.cn/admissions/contact-student-recruitment-group/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'var(--primary-dark)', marginLeft: '8px', textDecoration: 'underline' }}
                >
                  点击此处获取
                </a>
              </p>
            </div>

            <div className={styles.actions} style={{ flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div className={styles.agreementBox}>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span>我已认真阅读上述申请须知、实施办法及常见问答，确认符合申请条件。</span>
                </label>
              </div>
              <button 
                className={`${styles.btnPrimary} ${!isAgreed ? '' : styles.btnPulse}`} 
                onClick={handleNext}
                disabled={!isAgreed}
                style={{ width: '100%', maxWidth: '400px', fontSize: '18px', padding: '18px 36px' }}
              >
                开始填写申请表 →
              </button>
            </div>
          </div>
        )
      }

      case 1:
        return (
          <div className={styles.contentInner}>
            <h3 className={styles.contentTitle}>个人基本信息</h3>
            <p className={styles.contentSubtitle}>
              请填写真实有效的数据，系统将以身份证号作为唯一识别码。所有标记<span className="required">*</span>的字段为必填项。
            </p>

            <div className={styles.formGrid}>
              <div className={styles.formItem}>
                <label className={styles.label}>
                  姓名<span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className={styles.input}
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="请输入申请人中文姓名"
                  style={errors.name ? { borderColor: '#ef4444' } : {}}
                />
                {errors.name && (
                  <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    ⚠️ {errors.name}
                  </div>
                )}
              </div>

              <div className={styles.formItem}>
                <label className={styles.label}>
                  姓（拼音）<span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.familyName}
                  onChange={(e) => handleChange('familyName', e.target.value.toUpperCase())}
                  placeholder="例：WANG"
                  style={errors.familyName ? { 
                    borderColor: errors.familyName.startsWith('⚠️ 提醒') ? '#f59e0b' : '#ef4444' 
                  } : {}}
                />
                {errors.familyName && (
                  <div style={{ 
                    color: errors.familyName.startsWith('⚠️ 提醒') ? '#d97706' : '#ef4444',
                    backgroundColor: errors.familyName.startsWith('⚠️ 提醒') ? '#fef3c7' : 'transparent',
                    fontSize: '12px', 
                    marginTop: '4px',
                    padding: errors.familyName.startsWith('⚠️ 提醒') ? '6px 10px' : '0',
                    borderRadius: errors.familyName.startsWith('⚠️ 提醒') ? '4px' : '0'
                  }}>
                    {errors.familyName}
                  </div>
                )}
              </div>

              <div className={styles.formItem}>
                <label className={styles.label}>
                  名字（拼音）<span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.givenName}
                  onChange={(e) => handleChange('givenName', e.target.value.toUpperCase())}
                  placeholder="例：WEIDONG"
                  style={errors.givenName ? { 
                    borderColor: errors.givenName.startsWith('⚠️ 提醒') ? '#f59e0b' : '#ef4444' 
                  } : {}}
                />
                {errors.givenName && (
                  <div style={{ 
                    color: errors.givenName.startsWith('⚠️ 提醒') ? '#d97706' : '#ef4444',
                    backgroundColor: errors.givenName.startsWith('⚠️ 提醒') ? '#fef3c7' : 'transparent',
                    fontSize: '12px', 
                    marginTop: '4px',
                    padding: errors.givenName.startsWith('⚠️ 提醒') ? '6px 10px' : '0',
                    borderRadius: errors.givenName.startsWith('⚠️ 提醒') ? '4px' : '0'
                  }}>
                    {errors.givenName}
                  </div>
                )}
              </div>

              <div className={styles.formItem}>
                <label className={styles.label}>
                  性别<span className="required">*</span>
                </label>
                <select
                  className={styles.select}
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                >
                  <option value="">请选择</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>

              <div className={styles.formItem}>
                <label className={styles.label}>
                  民族<span className="required">*</span>
                </label>
                <select
                  className={styles.select}
                  value={formData.ethnicity}
                  onChange={(e) => handleChange('ethnicity', e.target.value)}
                >
                  <option value="">请选择</option>
                  {ethnicities.map(ethnicity => (
                    <option key={ethnicity} value={ethnicity}>{ethnicity}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formItem}>
                <label className={styles.label}>
                  出生日期<span className="required">*</span>
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select
                    className={styles.select}
                    style={{ flex: '0 0 90px' }}
                    value={formData.birthDate ? formData.birthDate.split('-')[0] : ''}
                    onChange={(e) => {
                      const year = e.target.value
                      if (year) {
                        const month = formData.birthDate ? formData.birthDate.split('-')[1] : '01'
                        const day = formData.birthDate ? formData.birthDate.split('-')[2] : '01'
                        handleChange('birthDate', `${year}-${month}-${day}`)
                      }
                    }}
                  >
                    <option value="">年</option>
                    {Array.from({ length: 21 }, (_, i) => 2010 - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <select
                    className={styles.select}
                    style={{ flex: '0 0 70px' }}
                    value={formData.birthDate ? formData.birthDate.split('-')[1] : ''}
                    onChange={(e) => {
                      const month = e.target.value
                      if (month && formData.birthDate) {
                        const year = formData.birthDate.split('-')[0]
                        const day = formData.birthDate.split('-')[2]
                        handleChange('birthDate', `${year}-${month}-${day}`)
                      }
                    }}
                    disabled={!formData.birthDate || !formData.birthDate.split('-')[0]}
                  >
                    <option value="">月</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month.toString().padStart(2, '0')}>
                        {month}月
                      </option>
                    ))}
                  </select>
                  <select
                    className={styles.select}
                    style={{ flex: '0 0 70px' }}
                    value={formData.birthDate ? formData.birthDate.split('-')[2] : ''}
                    onChange={(e) => {
                      const day = e.target.value
                      if (day && formData.birthDate) {
                        const year = formData.birthDate.split('-')[0]
                        const month = formData.birthDate.split('-')[1]
                        handleChange('birthDate', `${year}-${month}-${day}`)
                      }
                    }}
                    disabled={!formData.birthDate || !formData.birthDate.split('-')[1]}
                  >
                    <option value="">日</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day.toString().padStart(2, '0')}>
                        {day}日
                      </option>
                    ))}
                  </select>
                  <span style={{ color: '#9ca3af', fontSize: '12px', whiteSpace: 'nowrap' }}>或</span>
                  <input
                    type="date"
                    className={styles.input}
                    style={{ flex: '1', minWidth: '130px' }}
                    value={formData.birthDate}
                    onChange={(e) => handleChange('birthDate', e.target.value)}
                    max="2010-12-31"
                    min="1990-01-01"
                  />
                </div>
                {formData.birthDate && (
                  <div className={styles.note}>
                    已选择：{(() => {
                      const [y, m, d] = formData.birthDate.split('-')
                      return `${y}年${m}月${d}日`
                    })()}
                  </div>
                )}
              </div>

              <div className={styles.formItem}>
                <label className={styles.label}>
                  身份证号码<span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.idCard}
                  onChange={(e) => handleChange('idCard', e.target.value.toUpperCase())}
                  placeholder="请输入学生本人身份证号"
                  maxLength={18}
                  style={errors.idCard ? { borderColor: '#ef4444' } : {}}
                />
                {errors.idCard && (
                  <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    ⚠️ {errors.idCard}
                  </div>
                )}
                <div className={styles.note}>
                  注意：此号码将作为考生唯一识别码，请务必填写学生本人身份证号（18位），不能填写家长或他人证件号。
                </div>
              </div>

              <div className={styles.formItem}>
                <label className={styles.label}>
                  申请人邮箱<span className="required">*</span>
                </label>
                <input
                  type="email"
                  className={styles.input}
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="请输入有效邮箱地址"
                  style={errors.email ? { 
                    borderColor: errors.email.startsWith('⚠️ 提醒') ? '#f59e0b' : '#ef4444' 
                  } : {}}
                />
                {errors.email && (
                  <div style={{ 
                    color: errors.email.startsWith('⚠️ 提醒') ? '#d97706' : '#ef4444',
                    backgroundColor: errors.email.startsWith('⚠️ 提醒') ? '#fef3c7' : 'transparent',
                    fontSize: '12px', 
                    marginTop: '4px',
                    padding: errors.email.startsWith('⚠️ 提醒') ? '6px 10px' : '0',
                    borderRadius: errors.email.startsWith('⚠️ 提醒') ? '4px' : '0'
                  }}>
                    {errors.email}
                  </div>
                )}
              </div>

              <div className={styles.formItem}>
                <label className={styles.label}>
                  选考科目<span className="required">*</span>
                </label>
                <select
                  className={styles.select}
                  value={formData.subjects}
                  onChange={(e) => handleChange('subjects', e.target.value)}
                >
                  <option value="">请选择模式</option>
                  <option value="物理+化学">物理 + 化学</option>
                  <option value="其他组合">其他组合</option>
                </select>
                <div className={styles.note}>
                  2026年报考广以的考生须选择"物理+化学"。
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.btnSecondary} onClick={handlePrev}>
                ← 返回申请须知
              </button>
              <button className={styles.btnPrimary} onClick={handleNext}>
                下一步（家庭信息） →
              </button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className={styles.contentInner}>
            <h3 className={styles.contentTitle}>家庭基本信息</h3>
            <p className={styles.contentSubtitle}>
              请在此处填写申请人家庭相关信息，便于学校与家长联系。
            </p>

            <div className={styles.formGrid}>
              <div className={styles.formItem}>
                <label className={styles.label}>
                  家长姓名<span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.parentName}
                  onChange={(e) => handleChange('parentName', e.target.value)}
                  placeholder="请输入家长中文姓名"
                  style={errors.parentName ? { borderColor: '#ef4444' } : {}}
                />
                {errors.parentName && (
                  <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    ⚠️ {errors.parentName}
                  </div>
                )}
              </div>

              <div className={styles.formItem}>
                <label className={styles.label}>
                  手机<span className="required">*</span>
                </label>
                <input
                  type="tel"
                  className={styles.input}
                  value={formData.parentPhone}
                  onChange={(e) => handleChange('parentPhone', e.target.value)}
                  placeholder="请输入家长常用手机号"
                  maxLength={11}
                  style={errors.parentPhone ? { borderColor: '#ef4444' } : {}}
                />
                {errors.parentPhone && (
                  <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    ⚠️ {errors.parentPhone}
                  </div>
                )}
              </div>

              <div className={styles.formItem}>
                <label className={styles.label}>
                  微信<span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.parentWechat}
                  onChange={(e) => handleChange('parentWechat', e.target.value)}
                  placeholder="请输入家长微信号"
                />
              </div>

              <div className={styles.formItem}>
                <label className={styles.label}>
                  省份/直辖市/自治区<span className="required">*</span>
                </label>
                <select
                  className={styles.select}
                  value={formData.province}
                  onChange={(e) => handleChange('province', e.target.value)}
                >
                  <option value="">请选择省份/直辖市/自治区</option>
                  <option value="北京市">北京市</option>
                  <option value="天津市">天津市</option>
                  <option value="河北省">河北省</option>
                  <option value="山西省">山西省</option>
                  <option value="内蒙古自治区">内蒙古自治区</option>
                  <option value="辽宁省">辽宁省</option>
                  <option value="吉林省">吉林省</option>
                  <option value="黑龙江省">黑龙江省</option>
                  <option value="上海市">上海市</option>
                  <option value="江苏省">江苏省</option>
                  <option value="浙江省">浙江省</option>
                  <option value="安徽省">安徽省</option>
                  <option value="福建省">福建省</option>
                  <option value="江西省">江西省</option>
                  <option value="山东省">山东省</option>
                  <option value="河南省">河南省</option>
                  <option value="湖北省">湖北省</option>
                  <option value="湖南省">湖南省</option>
                  <option value="广东省">广东省</option>
                  <option value="广西壮族自治区">广西壮族自治区</option>
                  <option value="海南省">海南省</option>
                  <option value="重庆市">重庆市</option>
                  <option value="四川省">四川省</option>
                  <option value="贵州省">贵州省</option>
                  <option value="云南省">云南省</option>
                  <option value="西藏自治区">西藏自治区</option>
                  <option value="陕西省">陕西省</option>
                  <option value="甘肃省">甘肃省</option>
                  <option value="青海省">青海省</option>
                  <option value="宁夏回族自治区">宁夏回族自治区</option>
                  <option value="新疆维吾尔自治区">新疆维吾尔自治区</option>
                  <option value="台湾省">台湾省</option>
                  <option value="香港特别行政区">香港特别行政区</option>
                  <option value="澳门特别行政区">澳门特别行政区</option>
                </select>
              </div>

              <div className={styles.formItem}>
                <label className={styles.label}>
                  详细地址<span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="街道、社区、门牌号等"
                />
              </div>

              <div className={styles.formItem}>
                <label className={styles.label}>邮政编码</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.zipCode}
                  onChange={(e) => handleChange('zipCode', e.target.value)}
                  placeholder="请输入邮编"
                />
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.btnSecondary} onClick={handlePrev}>
                ← 上一步
              </button>
              <button className={styles.btnPrimary} onClick={handleNext}>
                下一步（高中学习经历） →
              </button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className={styles.contentInner}>
            <h3 className={styles.contentTitle}>高中学习经历</h3>
            <p className={styles.contentSubtitle}>
              请填写您的高中学习经历相关信息。
            </p>

            <div className={styles.formGrid}>
              <div className={styles.formItem}>
                <label className={styles.label}>
                  省份<span className="required">*</span>
                </label>
                <select 
                  className={styles.select}
                  value={selectedProvince}
                  onChange={(e) => {
                    setSelectedProvince(e.target.value)
                    handleChange('schoolProvince', e.target.value)
                    setSelectedCity('')
                    setSelectedDistrict('')
                    setSelectedSchool('')
                    setManualSchoolInput('')
                  }}
                >
                  <option value="">请选择省份</option>
                  {getProvinces().map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formItem}>
                <label className={styles.label}>
                  城市<span className="required">*</span>
                </label>
                <select 
                  className={styles.select}
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value)
                    handleChange('schoolCity', e.target.value)
                    setSelectedDistrict('')
                    setSelectedSchool('')
                    setManualSchoolInput('')
                  }}
                  disabled={!selectedProvince}
                >
                  <option value="">请选择城市</option>
                  {selectedProvince && getCitiesByProvince(selectedProvince).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formItem}>
                <label className={styles.label}>
                  区县<span className="required">*</span>
                </label>
                <select 
                  className={styles.select}
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value)
                    setSelectedSchool('')
                    setManualSchoolInput('')
                  }}
                  disabled={!selectedCity}
                >
                  <option value="">请选择区县</option>
                  {selectedCity && getDistrictsByCity(selectedProvince, selectedCity).map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formItem}>
                <label className={styles.label}>
                  学校<span className="required">*</span>
                </label>
                <select 
                  className={styles.select}
                  value={selectedSchool}
                  onChange={(e) => {
                    const value = e.target.value
                    setSelectedSchool(value)
                    if (value !== '其他（手动填写）') {
                      handleChange('school', value)
                      setManualSchoolInput('')
                    } else {
                      handleChange('school', '')
                    }
                  }}
                  disabled={!selectedDistrict}
                >
                  <option value="">请选择学校</option>
                  {selectedDistrict && getSchoolsByDistrict(selectedProvince, selectedCity, selectedDistrict).map(school => (
                    <option key={school} value={school}>{school}</option>
                  ))}
                </select>
              </div>

              {selectedSchool === '其他（手动填写）' && (
                <div className={styles.formItem}>
                  <label className={styles.label}>
                    请输入学校名称<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    value={manualSchoolInput}
                    onChange={(e) => {
                      setManualSchoolInput(e.target.value)
                      handleChange('school', e.target.value)
                    }}
                    placeholder="例如：XX市第一中学"
                  />
                </div>
              )}

              <div className={styles.formItem}>
                <label className={styles.label}>
                  班主任姓名<span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.classTeacher}
                  onChange={(e) => handleChange('classTeacher', e.target.value)}
                  placeholder="请输入班主任姓名"
                  style={errors.classTeacher ? { borderColor: '#ef4444' } : {}}
                />
                {errors.classTeacher && (
                  <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    ⚠️ {errors.classTeacher}
                  </div>
                )}
              </div>

              <div className={styles.formItem}>
                <label className={styles.label}>
                  班主任电话<span className="required">*</span>
                </label>
                <input
                  type="tel"
                  className={styles.input}
                  value={formData.classTeacherPhone}
                  onChange={(e) => handleChange('classTeacherPhone', e.target.value)}
                  placeholder="请输入班主任联系电话"
                  maxLength={11}
                  style={errors.classTeacherPhone ? { borderColor: '#ef4444' } : {}}
                />
                {errors.classTeacherPhone && (
                  <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    ⚠️ {errors.classTeacherPhone}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.btnSecondary} onClick={handlePrev}>
                ← 上一步
              </button>
              <button className={styles.btnPrimary} onClick={handleNext}>
                下一步（高中学习成绩） →
              </button>
            </div>
          </div>
        )

      case 4:
        // 学科特长：竞赛获奖信息；创新潜质：高中学习成绩
        if (scholarshipType === 'subject') {
          // 学科特长奖学金 - 竞赛获奖信息（必填）
          return (
            <div className={styles.contentInner}>
              <h3 className={styles.contentTitle}>竞赛获奖信息</h3>
              <p className={styles.contentSubtitle}>
                <span className="required">*</span> 学科特长奖学金申请者必须填写至少一项竞赛获奖信息。若有获奖竞赛，建议拿出获奖证书对照信息填写。
              </p>

              <div className={styles.highlightBar}>
                <p style={{ margin: '0 0 8px', fontWeight: '600' }}>💡 温馨提示</p>
                <p style={{ margin: '0', fontSize: '13px' }}>
                  ① 申请学科特长奖学金，此项为<strong>必填</strong>，至少填写一项获奖信息；<br/>
                  ② 可复制链接 <a href="http://gs.cyscc.org/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-dark)', textDecoration: 'underline' }}>http://gs.cyscc.org/</a> 搜索确认是否公示；<br/>
                  ③ 若已公示，将本人公示信息所在页面的网址复制粘贴到"公示链接"。
                </p>
              </div>

              {competitionAwards.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
                  <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#ef4444', fontWeight: 'bold' }}>
                    ⚠️ 请至少添加一项竞赛获奖信息
                  </p>
                  <button className={styles.addButton} onClick={handleAddCompetition}>
                    + 新增竞赛获奖信息
                  </button>
                </div>
              ) : (
                <>
                  {competitionAwards.map((award, index) => (
                    <div key={award.id} className={styles.competitionSection} style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h4 style={{ margin: 0, color: 'var(--primary-dark)', fontSize: '16px', fontWeight: '600' }}>
                          竞赛获奖 {index + 1}
                        </h4>
                        <button
                          className={styles.removeButton}
                          onClick={() => handleRemoveCompetition(award.id)}
                        >
                          ✕ 删除
                        </button>
                      </div>
                      
                      <div className={styles.formGrid}>
                        <div className={styles.formItem}>
                          <label className={styles.label}>竞赛名称<span className="required">*</span></label>
                          <select 
                            className={styles.select}
                            value={award.name}
                            onChange={(e) => handleCompetitionChange(award.id, 'name', e.target.value)}
                          >
                            <option value="">请选择</option>
                            <option value="全国中学生数学奥林匹克竞赛">全国中学生数学奥林匹克竞赛</option>
                            <option value="全国中学生物理奥林匹克竞赛">全国中学生物理奥林匹克竞赛</option>
                            <option value="全国中学生化学奥林匹克竞赛">全国中学生化学奥林匹克竞赛</option>
                            <option value="全国中学生生物学奥林匹克竞赛">全国中学生生物学奥林匹克竞赛</option>
                            <option value="全国青少年信息学奥林匹克竞赛">全国青少年信息学奥林匹克竞赛</option>
                          </select>
                        </div>

                        <div className={styles.formItem}>
                          <label className={styles.label}>证书颁发单位<span className="required">*</span></label>
                          <select 
                            className={styles.select}
                            value={award.issuer}
                            onChange={(e) => handleCompetitionChange(award.id, 'issuer', e.target.value)}
                          >
                            <option value="">请选择</option>
                            <option value="中国数学会">中国数学会</option>
                            <option value="中国物理学会">中国物理学会</option>
                            <option value="中国化学会">中国化学会</option>
                            <option value="中国动物学会">中国动物学会</option>
                            <option value="中国计算机学会">中国计算机学会</option>
                          </select>
                        </div>

                        <div className={styles.formItem}>
                          <label className={styles.label}>获奖时间<span className="required">*</span></label>
                          <input 
                            type="date" 
                            className={styles.input}
                            value={award.awardTime}
                            onChange={(e) => handleCompetitionChange(award.id, 'awardTime', e.target.value)}
                          />
                        </div>

                        <div className={styles.formItem}>
                          <label className={styles.label}>获奖等级<span className="required">*</span></label>
                          <select 
                            className={styles.select}
                            value={award.awardLevel}
                            onChange={(e) => handleCompetitionChange(award.id, 'awardLevel', e.target.value)}
                          >
                            <option value="">请选择</option>
                            <option value="国家级一等奖">国家级一等奖</option>
                            <option value="国家级二等奖">国家级二等奖</option>
                            <option value="国家级三等奖">国家级三等奖</option>
                            <option value="省级一等奖">省级一等奖</option>
                            <option value="省级二等奖">省级二等奖</option>
                            <option value="省级三等奖">省级三等奖</option>
                          </select>
                        </div>

                        <div className={styles.formItem}>
                          <label className={styles.label}>是否在 http://gs.cyscc.org/ 公示</label>
                          <select 
                            className={styles.select}
                            value={award.isPublished}
                            onChange={(e) => handleCompetitionChange(award.id, 'isPublished', e.target.value)}
                          >
                            <option value="">请选择</option>
                            <option value="是">是</option>
                            <option value="否">否</option>
                          </select>
                        </div>

                        <div className={styles.formItem} style={{ gridColumn: '1 / -1' }}>
                          <label className={styles.label}>公示链接</label>
                          <input 
                            type="url" 
                            className={styles.input}
                            value={award.publicLink}
                            onChange={(e) => handleCompetitionChange(award.id, 'publicLink', e.target.value)}
                            placeholder='若前一项选择"是"，此项必填' 
                          />
                          <div className={styles.note}>
                            将本人公示信息所在页面的完整网址粘贴到此处
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button className={styles.addButton} style={{ marginTop: '16px' }} onClick={handleAddCompetition}>
                    + 新增竞赛获奖信息
                  </button>
                </>
              )}

              <div className={styles.actions}>
                <button className={styles.btnSecondary} onClick={handlePrev}>
                  ← 上一步
                </button>
                <button className={styles.btnPrimary} onClick={handleNext}>
                  下一步（上传报名材料） →
                </button>
              </div>
            </div>
          )
        } else {
          // 创新潜质奖学金 - 高中学习成绩（必填）
          return (
          <div className={styles.contentInner}>
            <h3 className={styles.contentTitle}>高中学习成绩</h3>
            <p className={styles.contentSubtitle}>
              请填写最近两次模拟考试成绩，如无模拟考试，可填写联考、期末考试成绩。年级排名如无法提供，可填写"0"。
            </p>

            {scoreSheetDownloaded && (
              <div className={styles.highlightBar} style={{ background: '#fef3c7', borderLeft: '4px solid #f59e0b', marginBottom: '16px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#92400e', fontWeight: '600' }}>
                  🔒 成绩单已导出，成绩输入框已锁定，内容不可更改。
                </p>
              </div>
            )}

            {/* 考试一 */}
            <div className={styles.examSection}>
              <h4 className={styles.examTitle}>考试一</h4>
              
              <div className={styles.formItem}>
                <label className={styles.label}>
                  考试名称<span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.examName}
                  onChange={(e) => handleChange('examName', e.target.value)}
                  placeholder="例如：高三第二次模拟考试"
                />
              </div>

              <div className={styles.formGrid} style={{ marginTop: '16px' }}>
                <div className={styles.formItem}>
                  <label className={styles.label}>
                    总分<span className="required">*</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.totalScore}
                      onChange={(e) => handleChange('totalScore', e.target.value)}
                      placeholder="得分"
                      style={{ flex: 1, minWidth: '80px' }}
                    />
                    <span style={{ fontWeight: '600', color: '#6b7280', flexShrink: 0 }}>/</span>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.totalScoreMax}
                      onChange={(e) => handleChange('totalScoreMax', e.target.value)}
                      placeholder="满分"
                      style={{ flex: 1, minWidth: '80px' }}
                    />
                  </div>
                  <div className={styles.note}>例如：600/750</div>
                </div>

                <div className={styles.formItem}>
                  <label className={styles.label}>
                    语文<span className="required">*</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.chinese}
                      onChange={(e) => handleChange('chinese', e.target.value)}
                      placeholder="得分"
                      style={{ flex: 1, minWidth: '70px' }}
                    />
                    <span style={{ fontWeight: '600', color: '#6b7280', flexShrink: 0 }}>/</span>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.chineseMax}
                      onChange={(e) => handleChange('chineseMax', e.target.value)}
                      placeholder="满分"
                      style={{ flex: 1, minWidth: '70px' }}
                    />
                  </div>
                </div>

                <div className={styles.formItem}>
                  <label className={styles.label}>
                    数学<span className="required">*</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.math}
                      onChange={(e) => handleChange('math', e.target.value)}
                      placeholder="得分"
                      style={{ flex: 1, minWidth: '70px' }}
                    />
                    <span style={{ fontWeight: '600', color: '#6b7280', flexShrink: 0 }}>/</span>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.mathMax}
                      onChange={(e) => handleChange('mathMax', e.target.value)}
                      placeholder="满分"
                      style={{ flex: 1, minWidth: '70px' }}
                    />
                  </div>
                </div>

                <div className={styles.formItem}>
                  <label className={styles.label}>
                    外语<span className="required">*</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.english}
                      onChange={(e) => handleChange('english', e.target.value)}
                      placeholder="得分"
                      style={{ flex: 1, minWidth: '70px' }}
                    />
                    <span style={{ fontWeight: '600', color: '#6b7280', flexShrink: 0 }}>/</span>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.englishMax}
                      onChange={(e) => handleChange('englishMax', e.target.value)}
                      placeholder="满分"
                      style={{ flex: 1, minWidth: '70px' }}
                    />
                  </div>
                </div>

                <div className={styles.formItem}>
                  <label className={styles.label}>
                    物理<span className="required">*</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.physics}
                      onChange={(e) => handleChange('physics', e.target.value)}
                      placeholder="得分"
                      style={{ flex: 1, minWidth: '70px' }}
                    />
                    <span style={{ fontWeight: '600', color: '#6b7280', flexShrink: 0 }}>/</span>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.physicsMax}
                      onChange={(e) => handleChange('physicsMax', e.target.value)}
                      placeholder="满分"
                      style={{ flex: 1, minWidth: '70px' }}
                    />
                  </div>
                </div>

                <div className={styles.formItem}>
                  <label className={styles.label}>
                    化学<span className="required">*</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.chemistry}
                      onChange={(e) => handleChange('chemistry', e.target.value)}
                      placeholder="得分"
                      style={{ flex: 1, minWidth: '70px' }}
                    />
                    <span style={{ fontWeight: '600', color: '#6b7280', flexShrink: 0 }}>/</span>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.chemistryMax}
                      onChange={(e) => handleChange('chemistryMax', e.target.value)}
                      placeholder="满分"
                      style={{ flex: 1, minWidth: '70px' }}
                    />
                  </div>
                </div>

                <div className={styles.formItem}>
                  <label className={styles.label}>
                    年级排名（物理类排名）<span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.classRank}
                    onChange={(e) => handleChange('classRank', e.target.value)}
                    placeholder="无排名请填0"
                  />
                </div>

                <div className={styles.formItem}>
                  <label className={styles.label}>
                    年级人数（物理类总人数）<span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.totalStudents}
                    onChange={(e) => handleChange('totalStudents', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 考试二 */}
            <div className={styles.examSection}>
              <h4 className={styles.examTitle}>考试二</h4>
              
              <div className={styles.formItem}>
                <label className={styles.label}>
                  考试名称<span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.examName2}
                  onChange={(e) => handleChange('examName2', e.target.value)}
                  placeholder="例如：高三第一次模拟考试"
                />
              </div>

              <div className={styles.formGrid} style={{ marginTop: '16px' }}>
                <div className={styles.formItem}>
                  <label className={styles.label}>
                    总分<span className="required">*</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.totalScore2}
                      onChange={(e) => handleChange('totalScore2', e.target.value)}
                      placeholder="得分"
                      style={{ flex: 1, minWidth: '80px' }}
                    />
                    <span style={{ fontWeight: '600', color: '#6b7280', flexShrink: 0 }}>/</span>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.totalScoreMax2}
                      onChange={(e) => handleChange('totalScoreMax2', e.target.value)}
                      placeholder="满分"
                      style={{ flex: 1, minWidth: '80px' }}
                    />
                  </div>
                </div>

                <div className={styles.formItem}>
                  <label className={styles.label}>
                    语文<span className="required">*</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.chinese2}
                      onChange={(e) => handleChange('chinese2', e.target.value)}
                      placeholder="得分"
                      style={{ flex: 1, minWidth: '70px' }}
                    />
                    <span style={{ fontWeight: '600', color: '#6b7280', flexShrink: 0 }}>/</span>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.chineseMax2}
                      onChange={(e) => handleChange('chineseMax2', e.target.value)}
                      placeholder="满分"
                      style={{ flex: 1, minWidth: '70px' }}
                    />
                  </div>
                </div>

                <div className={styles.formItem}>
                  <label className={styles.label}>
                    数学<span className="required">*</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.math2}
                      onChange={(e) => handleChange('math2', e.target.value)}
                      placeholder="得分"
                      style={{ flex: 1, minWidth: '70px' }}
                    />
                    <span style={{ fontWeight: '600', color: '#6b7280', flexShrink: 0 }}>/</span>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.mathMax2}
                      onChange={(e) => handleChange('mathMax2', e.target.value)}
                      placeholder="满分"
                      style={{ flex: 1, minWidth: '70px' }}
                    />
                  </div>
                </div>

                <div className={styles.formItem}>
                  <label className={styles.label}>
                    外语<span className="required">*</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.english2}
                      onChange={(e) => handleChange('english2', e.target.value)}
                      placeholder="得分"
                      style={{ flex: 1, minWidth: '70px' }}
                    />
                    <span style={{ fontWeight: '600', color: '#6b7280', flexShrink: 0 }}>/</span>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.englishMax2}
                      onChange={(e) => handleChange('englishMax2', e.target.value)}
                      placeholder="满分"
                      style={{ flex: 1, minWidth: '70px' }}
                    />
                  </div>
                </div>

                <div className={styles.formItem}>
                  <label className={styles.label}>
                    物理<span className="required">*</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.physics2}
                      onChange={(e) => handleChange('physics2', e.target.value)}
                      placeholder="得分"
                      style={{ flex: 1, minWidth: '70px' }}
                    />
                    <span style={{ fontWeight: '600', color: '#6b7280', flexShrink: 0 }}>/</span>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.physicsMax2}
                      onChange={(e) => handleChange('physicsMax2', e.target.value)}
                      placeholder="满分"
                      style={{ flex: 1, minWidth: '70px' }}
                    />
                  </div>
                </div>

                <div className={styles.formItem}>
                  <label className={styles.label}>
                    化学<span className="required">*</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.chemistry2}
                      onChange={(e) => handleChange('chemistry2', e.target.value)}
                      placeholder="得分"
                      style={{ flex: 1, minWidth: '70px' }}
                    />
                    <span style={{ fontWeight: '600', color: '#6b7280', flexShrink: 0 }}>/</span>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.chemistryMax2}
                      onChange={(e) => handleChange('chemistryMax2', e.target.value)}
                      placeholder="满分"
                      style={{ flex: 1, minWidth: '70px' }}
                    />
                  </div>
                </div>

                <div className={styles.formItem}>
                  <label className={styles.label}>
                    年级排名（物理类排名）<span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.classRank2}
                    onChange={(e) => handleChange('classRank2', e.target.value)}
                    placeholder="无排名请填0"
                  />
                </div>

                <div className={styles.formItem}>
                  <label className={styles.label}>
                    年级人数（物理类总人数）<span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.totalStudents2}
                    onChange={(e) => handleChange('totalStudents2', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className={styles.highlightBar} style={{ marginTop: '24px' }}>
              <p style={{ margin: '0 0 12px', fontWeight: '600' }}>📥 成绩单准备说明</p>
              <p style={{ margin: '0 0 12px', fontSize: '13px', lineHeight: '1.8' }}>
                <strong style={{ color: '#92400e' }}>选项一：使用学校出具的成绩单</strong><br/>
                如果您有高中学校出具并加盖公章的成绩单，请<strong>不必填写</strong>上方的成绩信息，在下一步"上传报名材料"中直接扫描上传至"高中成绩表"即可。<br/><br/>
                <strong style={{ color: '#92400e' }}>选项二：使用我们提供的模板</strong><br/>
                如果您没有学校成绩单，请<strong>填写完整</strong>上方的所有成绩信息，然后点击下方"下载成绩单模板"按钮。下载后打印、加盖学校公章、扫描上传。
              </p>
              <button 
                className={styles.btnPrimary} 
                onClick={handleDownloadScoreSheet}
                style={{ margin: '0' }}
              >
                📄 下载成绩单模板
              </button>
              <p style={{ margin: '12px 0 0', fontSize: '12px', color: '#78350f' }}>
                下载的成绩单模板须打印并加盖学校公章，然后扫描上传至"上传报名材料"步骤。
              </p>
            </div>

            <div className={styles.actions}>
              <button className={styles.btnSecondary} onClick={handlePrev}>
                ← 上一步
              </button>
              <button className={styles.btnPrimary} onClick={handleNext}>
                下一步（上传报名材料） →
              </button>
            </div>
          </div>
        )
        }

      case 5:
        // 上传报名材料（两种类型都需要）
        return (
          <div className={styles.contentInner}>
            <h3 className={styles.contentTitle}>上传报名材料</h3>
            <p className={styles.contentSubtitle}>
              请按要求上传相关材料。所有文件格式支持：PDF、JPG、PNG，单个文件不超过10MB。
            </p>

            <div className={styles.uploadSection}>
              {/* 身份证扫描件 */}
              <div className={styles.uploadItem}>
                <div className={styles.uploadHeader}>
                  <h4>① 身份证扫描件<span className="required">*</span></h4>
                  <span className={styles.requiredBadge}>必填</span>
                </div>
                <p className={styles.uploadNote}>
                  身份证的正反面须在同一页上上传
                </p>
                {!idCardAttachment ? (
                  <div className={styles.uploadBox}>
                    <input 
                      type="file" 
                      id="idCard" 
                      accept=".pdf,.jpg,.jpeg,.png" 
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileUpload(e, 'idCard')}
                      disabled={uploadingFile === 'idCard'}
                    />
                    <label htmlFor="idCard" className={styles.uploadLabel}>
                      <span>{uploadingFile === 'idCard' ? '⏳ 上传中...' : '📎 点击选择文件'}</span>
                    </label>
                    <div className={styles.uploadHint}>支持 PDF、JPG、PNG 格式，不超过 10MB</div>
                  </div>
                ) : (
                  <div className={styles.uploadedFile}>
                    <div className={styles.fileInfo}>
                      <span className={styles.fileName}>✅ {idCardAttachment.name}</span>
                      <span className={styles.fileSize}>({(idCardAttachment.size / 1024).toFixed(2)} KB)</span>
                    </div>
                    <div className={styles.fileActions}>
                      {idCardAttachment.type.startsWith('image/') && (
                        <button 
                          className={styles.btnPreview}
                          onClick={() => handlePreviewAttachment(idCardAttachment.dataUrl)}
                        >
                          👁️ 预览
                        </button>
                      )}
                      <button 
                        className={styles.btnDelete}
                        onClick={() => handleDeleteAttachment('idCard')}
                      >
                        🗑️ 删除
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 高中成绩表 */}
              <div className={styles.uploadItem}>
                <div className={styles.uploadHeader}>
                  <h4>② 高中成绩表{scholarshipType === 'innovation' && <span className="required">*</span>}</h4>
                  {scholarshipType === 'innovation' ? (
                    <span className={styles.requiredBadge}>必填</span>
                  ) : (
                    <span className={styles.optionalBadge}>选填</span>
                  )}
                </div>
                <p className={styles.uploadNote}>
                  {scholarshipType === 'innovation' 
                    ? '请上传加盖学校公章的高中成绩单（可以是学校出具的成绩单，或使用我们提供的模板）'
                    : '学科特长奖学金申请者可选填成绩单'}
                </p>
                {!scoreSheetAttachment ? (
                  <div className={styles.uploadBox}>
                    <input 
                      type="file" 
                      id="scoreSheet" 
                      accept=".pdf,.jpg,.jpeg,.png" 
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileUpload(e, 'scoreSheet')}
                      disabled={uploadingFile === 'scoreSheet'}
                    />
                    <label htmlFor="scoreSheet" className={styles.uploadLabel}>
                      <span>{uploadingFile === 'scoreSheet' ? '⏳ 上传中...' : '📎 点击选择文件'}</span>
                    </label>
                    <div className={styles.uploadHint}>必须加盖学校公章</div>
                  </div>
                ) : (
                  <div className={styles.uploadedFile}>
                    <div className={styles.fileInfo}>
                      <span className={styles.fileName}>✅ {scoreSheetAttachment.name}</span>
                      <span className={styles.fileSize}>({(scoreSheetAttachment.size / 1024).toFixed(2)} KB)</span>
                    </div>
                    <div className={styles.fileActions}>
                      {scoreSheetAttachment.type.startsWith('image/') && (
                        <button 
                          className={styles.btnPreview}
                          onClick={() => handlePreviewAttachment(scoreSheetAttachment.dataUrl)}
                        >
                          👁️ 预览
                        </button>
                      )}
                      <button 
                        className={styles.btnDelete}
                        onClick={() => handleDeleteAttachment('scoreSheet')}
                      >
                        🗑️ 删除
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 竞赛获奖证书 */}
              <div className={styles.uploadItem}>
                <div className={styles.uploadHeader}>
                  <h4>③ 学科竞赛获奖证书{scholarshipType === 'subject' && <span className="required">*</span>}</h4>
                  {scholarshipType === 'subject' ? (
                    <span className={styles.requiredBadge}>必填</span>
                  ) : (
                    <span className={styles.optionalBadge}>选填</span>
                  )}
                </div>
                <p className={styles.uploadNote}>
                  {scholarshipType === 'subject' 
                    ? '学科特长奖学金申请者必须上传竞赛获奖证书'
                    : '若填写了竞赛获奖信息，此处须上传相应证书'}
                </p>
                <div className={styles.uploadBox}>
                  <input 
                    type="file" 
                    id="competition" 
                    accept=".pdf,.jpg,.jpeg,.png" 
                    style={{ display: 'none' }} 
                    multiple
                    onChange={(e) => handleFileUpload(e, 'competition')}
                    disabled={uploadingFile === 'competition'}
                  />
                  <label htmlFor="competition" className={styles.uploadLabel}>
                    <span>{uploadingFile === 'competition' ? '⏳ 上传中...' : '📎 点击选择文件（可多选）'}</span>
                  </label>
                </div>
                {competitionAttachments.length > 0 && (
                  <div className={styles.fileList}>
                    {competitionAttachments.map((file, index) => (
                      <div key={index} className={styles.uploadedFile}>
                        <div className={styles.fileInfo}>
                          <span className={styles.fileName}>✅ {file.name}</span>
                          <span className={styles.fileSize}>({(file.size / 1024).toFixed(2)} KB)</span>
                        </div>
                        <div className={styles.fileActions}>
                          {file.type.startsWith('image/') && (
                            <button 
                              className={styles.btnPreview}
                              onClick={() => handlePreviewAttachment(file.dataUrl)}
                            >
                              👁️ 预览
                            </button>
                          )}
                          <button 
                            className={styles.btnDelete}
                            onClick={() => handleDeleteAttachment('competition', index)}
                          >
                            🗑️ 删除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 其他证明材料 */}
              <div className={styles.uploadItem}>
                <div className={styles.uploadHeader}>
                  <h4>④ 其他证明材料</h4>
                  <span className={styles.optionalBadge}>选填</span>
                </div>
                <p className={styles.uploadNote}>
                  根据实际情况相应上传（如荣誉证书等）
                </p>
                <div className={styles.uploadBox}>
                  <input 
                    type="file" 
                    id="others" 
                    accept=".pdf,.jpg,.jpeg,.png" 
                    style={{ display: 'none' }} 
                    multiple
                    onChange={(e) => handleFileUpload(e, 'other')}
                    disabled={uploadingFile === 'other'}
                  />
                  <label htmlFor="others" className={styles.uploadLabel}>
                    <span>{uploadingFile === 'other' ? '⏳ 上传中...' : '📎 点击选择文件（可多选）'}</span>
                  </label>
                </div>
                {otherAttachments.length > 0 && (
                  <div className={styles.fileList}>
                    {otherAttachments.map((file, index) => (
                      <div key={index} className={styles.uploadedFile}>
                        <div className={styles.fileInfo}>
                          <span className={styles.fileName}>✅ {file.name}</span>
                          <span className={styles.fileSize}>({(file.size / 1024).toFixed(2)} KB)</span>
                        </div>
                        <div className={styles.fileActions}>
                          {file.type.startsWith('image/') && (
                            <button 
                              className={styles.btnPreview}
                              onClick={() => handlePreviewAttachment(file.dataUrl)}
                            >
                              👁️ 预览
                            </button>
                          )}
                          <button 
                            className={styles.btnDelete}
                            onClick={() => handleDeleteAttachment('other', index)}
                          >
                            🗑️ 删除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.btnSecondary} onClick={handlePrev}>
                ← 上一步
              </button>
              <button className={styles.btnPrimary} onClick={handleNext}>
                下一步（申请信息预览） →
              </button>
            </div>
          </div>
        )

      case 6:
        // 报名信息预览及提交（两种类型都需要）
        return (
          <div className={styles.contentInner}>
            <h3 className={styles.contentTitle}>申请信息预览及提交</h3>
            <p className={styles.contentSubtitle}>
              请仔细核对以下信息，确认无误后提交申请。提交后不可再编辑！
            </p>

            {appState.isLocked && (
              <div className={styles.statusAlert} style={{ 
                background: appState.status === 'approved' ? '#d1fae5' : 
                           appState.status === 'rejected' ? '#fee2e2' : '#dbeafe',
                color: appState.status === 'approved' ? '#065f46' : 
                       appState.status === 'rejected' ? '#991b1b' : '#1e40af',
                padding: '16px 20px',
                borderRadius: '8px',
                marginBottom: '24px',
                fontWeight: '600'
              }}>
                ✓ 申请状态：{getStatusText(appState.status)}
                {appState.submitDate && <span style={{ marginLeft: '16px', fontWeight: 'normal' }}>提交时间：{appState.submitDate}</span>}
              </div>
            )}

            <div className={styles.guideSection}>
              <h4>个人基本信息</h4>
              <p>姓名：{formData.name || '未填写'}</p>
              <p>性别：{formData.gender || '未填写'}</p>
              <p>民族：{formData.ethnicity || '未填写'}</p>
              <p>出生日期：{formData.birthDate || '未填写'}</p>
              <p>身份证号：{formData.idCard || '未填写'}</p>
              <p>邮箱：{formData.email || '未填写'}</p>
              <p>选考科目：{formData.subjects || '未填写'}</p>

              <h4>高中学习经历</h4>
              <p>就读学校：{formData.school || '未填写'}</p>
              <p>班主任姓名：{formData.classTeacher || '未填写'}</p>
              <p>班主任电话：{formData.classTeacherPhone || '未填写'}</p>

              <h4>家庭信息</h4>
              <p>家长姓名：{formData.parentName || '未填写'}</p>
              <p>联系电话：{formData.parentPhone || '未填写'}</p>
              <p>微信号：{formData.parentWechat || '未填写'}</p>
              <p>家庭地址：{formData.province} {formData.address}</p>
              <p>邮政编码：{formData.zipCode || '未填写'}</p>

              {scholarshipType === 'subject' ? (
                <>
                  <h4>竞赛获奖信息</h4>
                  {competitionAwards.length > 0 ? competitionAwards.map((award, index) => (
                    <div key={award.id} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: index < competitionAwards.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                      <p style={{ fontWeight: '600', color: 'var(--primary-dark)', marginBottom: '8px' }}>竞赛 {index + 1}</p>
                      <p>竞赛名称：{award.name || '未填写'}</p>
                      <p>证书颁发单位：{award.issuer || '未填写'}</p>
                      <p>获奖时间：{award.awardTime || '未填写'}</p>
                      <p>获奖等级：{award.awardLevel || '未填写'}</p>
                      <p>是否在 gs.cyscc.org 公示：{award.isPublished || '未填写'}</p>
                      <p>公示链接：{award.publicLink || '未填写'}</p>
                    </div>
                  )) : (
                    <p style={{ color: '#9ca3af' }}>暂无竞赛获奖信息</p>
                  )}
                </>
              ) : (
                <>
                  <h4>考试成绩</h4>
                  <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
                    <p style={{ fontWeight: '600', color: 'var(--primary-dark)', marginBottom: '8px' }}>考试一</p>
                    <p>考试名称：{formData.examName || '未填写'}</p>
                    <p>总分：{formData.totalScore ? `${formData.totalScore}/${formData.totalScoreMax || '750'}` : '未填写'}</p>
                    <p>各科成绩：
                      语文 {formData.chinese ? `${formData.chinese}/${formData.chineseMax || '150'}` : '-'} / 
                      数学 {formData.math ? `${formData.math}/${formData.mathMax || '150'}` : '-'} / 
                      英语 {formData.english ? `${formData.english}/${formData.englishMax || '150'}` : '-'} / 
                      物理 {formData.physics ? `${formData.physics}/${formData.physicsMax || '100'}` : '-'} / 
                      化学 {formData.chemistry ? `${formData.chemistry}/${formData.chemistryMax || '100'}` : '-'}
                    </p>
                    <p>年级排名：{formData.classRank || '未填写'} / {formData.totalStudents || '未填写'}</p>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontWeight: '600', color: 'var(--primary-dark)', marginBottom: '8px' }}>考试二</p>
                    <p>考试名称：{formData.examName2 || '未填写'}</p>
                    <p>总分：{formData.totalScore2 ? `${formData.totalScore2}/${formData.totalScoreMax2 || '750'}` : '未填写'}</p>
                    <p>各科成绩：
                      语文 {formData.chinese2 ? `${formData.chinese2}/${formData.chineseMax2 || '150'}` : '-'} / 
                      数学 {formData.math2 ? `${formData.math2}/${formData.mathMax2 || '150'}` : '-'} / 
                      英语 {formData.english2 ? `${formData.english2}/${formData.englishMax2 || '150'}` : '-'} / 
                      物理 {formData.physics2 ? `${formData.physics2}/${formData.physicsMax2 || '100'}` : '-'} / 
                      化学 {formData.chemistry2 ? `${formData.chemistry2}/${formData.chemistryMax2 || '100'}` : '-'}
                    </p>
                    <p>年级排名：{formData.classRank2 || '未填写'} / {formData.totalStudents2 || '未填写'}</p>
                  </div>
                </>
              )}

              <h4>报名材料</h4>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '12px' }}>
                {idCardAttachment && (
                  <div style={{ width: '200px' }}>
                    <p style={{ fontWeight: '500', marginBottom: '8px' }}>身份证扫描件</p>
                    {idCardAttachment.type.startsWith('image/') ? (
                      <img 
                        src={idCardAttachment.dataUrl} 
                        alt="身份证" 
                        style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e5e7eb' }}
                        onClick={() => handlePreviewAttachment(idCardAttachment.dataUrl)}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <span>📄 PDF文件</span>
                      </div>
                    )}
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{idCardAttachment.name}</p>
                  </div>
                )}
                
                {scoreSheetAttachment && (
                  <div style={{ width: '200px' }}>
                    <p style={{ fontWeight: '500', marginBottom: '8px' }}>高中成绩表</p>
                    {scoreSheetAttachment.type.startsWith('image/') ? (
                      <img 
                        src={scoreSheetAttachment.dataUrl} 
                        alt="成绩表" 
                        style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e5e7eb' }}
                        onClick={() => handlePreviewAttachment(scoreSheetAttachment.dataUrl)}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <span>📄 PDF文件</span>
                      </div>
                    )}
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{scoreSheetAttachment.name}</p>
                  </div>
                )}
                
                {competitionAttachments.map((file, index) => (
                  <div key={index} style={{ width: '200px' }}>
                    <p style={{ fontWeight: '500', marginBottom: '8px' }}>竞赛证书 {index + 1}</p>
                    {file.type.startsWith('image/') ? (
                      <img 
                        src={file.dataUrl} 
                        alt={`竞赛证书${index + 1}`} 
                        style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e5e7eb' }}
                        onClick={() => handlePreviewAttachment(file.dataUrl)}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <span>📄 PDF文件</span>
                      </div>
                    )}
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{file.name}</p>
                  </div>
                ))}
                
                {otherAttachments.map((file, index) => (
                  <div key={index} style={{ width: '200px' }}>
                    <p style={{ fontWeight: '500', marginBottom: '8px' }}>其他材料 {index + 1}</p>
                    {file.type.startsWith('image/') ? (
                      <img 
                        src={file.dataUrl} 
                        alt={`其他材料${index + 1}`} 
                        style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e5e7eb' }}
                        onClick={() => handlePreviewAttachment(file.dataUrl)}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <span>📄 PDF文件</span>
                      </div>
                    )}
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{file.name}</p>
                  </div>
                ))}
              </div>
              
              {!idCardAttachment && !scoreSheetAttachment && competitionAttachments.length === 0 && otherAttachments.length === 0 && (
                <p style={{ color: '#9ca3af', marginTop: '12px' }}>暂无上传的材料</p>
              )}
            </div>

            {!appState.isLocked && (
              <div className={styles.highlightBar} style={{ background: '#fee2e2', borderLeft: '4px solid #ef4444' }}>
                <p style={{ margin: '0 0 8px', fontWeight: '600', color: '#991b1b' }}>⚠️ 重要提示</p>
                <p style={{ margin: '0', fontSize: '13px', color: '#7f1d1d' }}>
                  • 再次确认信息无误，提交后不可再编辑<br/>
                  • 6月中旬后，可在系统首页查看入围结果<br/>
                  • 请确保已上传所有必需的材料（身份证、盖章成绩单）
                </p>
              </div>
            )}

            <div className={styles.actions}>
              {!appState.isLocked && (
                <>
                  <button className={styles.btnSecondary} onClick={handlePrev}>
                    ← 返回修改
                  </button>
                  <button className={styles.btnPrimary} onClick={handleSubmitApplication}>
                    确认提交申请 ✓
                  </button>
                </>
              )}
              {appState.isLocked && (
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <p style={{ color: '#10b981', fontWeight: '600', fontSize: '16px' }}>
                    ✓ 您的申请已成功提交！
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>
                    入围结果将于 6月中旬 公布，届时请登录系统查看
                  </p>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // 创建顶部操作按钮
  const headerActions = (
    <>
      <div className={styles.userInfo}>
        <span className={styles.userName}>👤 {studentName}</span>
        <span className={styles.userIdCard}>({studentIdCard})</span>
      </div>
      {!appState.isLocked && currentStep > 0 && (
        <button className={styles.headerBtnSave} onClick={handleSaveProgress}>
          💾 保存进度
        </button>
      )}
      <button className={styles.headerBtn} onClick={handleGoHome}>
        🏠 我的面板
      </button>
      <button className={styles.headerBtnLogout} onClick={handleLogout}>
        🚪 退出登录
      </button>
    </>
  )

  return (
    <>
      {/* 图片预览模态框 */}
      {previewImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setPreviewImage(null)}
        >
          <button
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '24px',
              cursor: 'pointer',
              zIndex: 10000
            }}
            onClick={() => setPreviewImage(null)}
          >
            ✕
          </button>
          <img 
            src={previewImage} 
            alt="预览" 
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      
      <Layout 
        sidebar={<Sidebar steps={steps} currentStep={currentStep} onStepClick={handleStepClick} scholarshipType={scholarshipType} maxReachedStep={maxReachedStep} />}
        headerActions={headerActions}
        title={scholarshipType === 'subject' ? '学科特长奖学金申请系统' : '创新潜质奖学金申请系统'}
        subtitle={scholarshipType === 'subject' ? 'Subject Specialty Scholarship Application System' : 'Innovative Potential Scholarship Application System'}
      >
      {/* 申请状态栏 */}
      {showStatusBar && currentStep !== 0 && (
        <div className={styles.statusBar} style={{
          background: getStatusColor(appState.status),
          color: 'white',
          padding: '16px 24px',
          marginBottom: '20px',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong style={{ fontSize: '16px' }}>申请状态：{getStatusText(appState.status)}</strong>
            {appState.submitDate && (
              <span style={{ marginLeft: '16px', fontSize: '14px', opacity: 0.9 }}>
                提交时间：{appState.submitDate}
              </span>
            )}
            {appState.status === 'pending' && (
              <span style={{ marginLeft: '16px', fontSize: '14px', opacity: 0.9 }}>
                • 6月中旬后可查看入围结果
              </span>
            )}
          </div>
          <button 
            onClick={() => setShowStatusBar(false)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            隐藏
          </button>
        </div>
      )}
      
      {renderStep()}
      </Layout>
    </>
  )
}

export default StudentApplication

