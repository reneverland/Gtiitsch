import { applicationAPI } from '../services/api'

// 申请状态管理
export type ApplicationStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected'
export type ScholarshipType = 'subject' | 'innovation'

export interface ApplicationState {
  status: ApplicationStatus
  isLocked: boolean // 是否已提交锁定
  scholarshipType?: ScholarshipType // 已提交的奖学金类型
  submitDate?: string
  reviewDate?: string
  modifyRequested?: boolean // 是否已申请修改
  modifyApproved?: boolean // 修改是否已批准
  modifyUsed?: boolean // 是否已使用修改机会
}

// 获取申请状态（从数据库）
export const getApplicationState = async (): Promise<ApplicationState> => {
  try {
    const studentIdCard = localStorage.getItem('studentIdCard')
    if (!studentIdCard) {
      return {
        status: 'not_submitted',
        isLocked: false
      }
    }

    const response = await applicationAPI.getMyApplication(studentIdCard)
    
    if (response.success && response.application) {
      const app = response.application
      return {
        status: app.status as ApplicationStatus,
        isLocked: app.status !== 'not_submitted',
        scholarshipType: app.scholarship_type as ScholarshipType,
        submitDate: app.submit_date,
        reviewDate: app.review_date,
        modifyRequested: app.modify_requested === 1,
        modifyApproved: app.modify_approved === 1,
        modifyUsed: app.modify_used === 1
      }
    }

    return {
      status: 'not_submitted',
      isLocked: false
    }
  } catch (error) {
    console.error('获取申请状态失败:', error)
    return {
      status: 'not_submitted',
      isLocked: false
    }
  }
}

// 提交申请（保存到数据库）
export const submitApplication = async (
  scholarshipType: ScholarshipType,
  formData?: any,
  competitionAwards?: any[],
  attachments?: {
    idCard?: any
    scoreSheet?: any
    competition?: any[]
    other?: any[]
  }
): Promise<ApplicationState> => {
  try {
    const studentIdCard = localStorage.getItem('studentIdCard')
    
    if (!studentIdCard) {
      throw new Error('未找到学生身份证号')
    }

    const applicationData: Record<string, any> = {
      student_id_card: studentIdCard,
      scholarship_type: scholarshipType,
      competition_awards: competitionAwards || [],
      id_card_attachment: attachments?.idCard ? JSON.stringify(attachments.idCard) : null,
      score_sheet_attachment: attachments?.scoreSheet ? JSON.stringify(attachments.scoreSheet) : null,
      competition_attachments: attachments?.competition || [],
      other_attachments: attachments?.other || [],
      name: formData?.name,
      family_name: formData?.familyName,
      given_name: formData?.givenName,
      gender: formData?.gender,
      ethnicity: formData?.ethnicity,
      birth_date: formData?.birthDate,
      email: formData?.email,
      school: formData?.school,
      subjects: formData?.subjects,
      high_school_class: formData?.highSchoolClass,
      class_teacher: formData?.classTeacher,
      class_teacher_phone: formData?.classTeacherPhone,
      school_address: formData?.schoolAddress,
      school_province: formData?.schoolProvince,
      school_city: formData?.schoolCity,
      parent_name: formData?.parentName,
      parent_phone: formData?.parentPhone,
      parent_wechat: formData?.parentWechat,
      country: formData?.country,
      province: formData?.province,
      address: formData?.address,
      zip_code: formData?.zipCode,
      exam_name: formData?.examName,
      total_score: formData?.totalScore,
      total_score_max: formData?.totalScoreMax,
      chinese: formData?.chinese,
      chinese_max: formData?.chineseMax,
      math: formData?.math,
      math_max: formData?.mathMax,
      english: formData?.english,
      english_max: formData?.englishMax,
      physics: formData?.physics,
      physics_max: formData?.physicsMax,
      chemistry: formData?.chemistry,
      chemistry_max: formData?.chemistryMax,
      class_rank: formData?.classRank,
      total_students: formData?.totalStudents,
      exam_name2: formData?.examName2,
      total_score2: formData?.totalScore2,
      total_score_max2: formData?.totalScoreMax2,
      chinese2: formData?.chinese2,
      chinese_max2: formData?.chineseMax2,
      math2: formData?.math2,
      math_max2: formData?.mathMax2,
      english2: formData?.english2,
      english_max2: formData?.englishMax2,
      physics2: formData?.physics2,
      physics_max2: formData?.physicsMax2,
      chemistry2: formData?.chemistry2,
      chemistry_max2: formData?.chemistryMax2,
      class_rank2: formData?.classRank2,
      total_students2: formData?.totalStudents2,
    }

    const response = await applicationAPI.submit(applicationData)

    if (response.success) {
      const state: ApplicationState = {
        status: 'pending',
        isLocked: true,
        scholarshipType: scholarshipType,
        submitDate: new Date().toLocaleDateString('zh-CN')
      }
      return state
    } else {
      throw new Error(response.message || '提交失败')
    }
  } catch (error) {
    console.error('提交申请失败:', error)
    throw error
  }
}

// 获取状态文本
export const getStatusText = (status: ApplicationStatus): string => {
  switch (status) {
    case 'not_submitted':
      return '未提交'
    case 'pending':
      return '已提交待审核'
    case 'approved':
      return '已入围'
    case 'rejected':
      return '未入围'
    default:
      return '未知状态'
  }
}

// 获取状态颜色
export const getStatusColor = (status: ApplicationStatus): string => {
  switch (status) {
    case 'not_submitted':
      return '#f59e0b' // 橙色
    case 'pending':
      return '#3b82f6' // 蓝色
    case 'approved':
      return '#10b981' // 绿色
    case 'rejected':
      return '#ef4444' // 红色
    default:
      return '#6b7280' // 灰色
  }
}

// 获取奖学金类型名称
export const getScholarshipTypeName = (type: ScholarshipType): string => {
  return type === 'subject' ? '学科特长奖学金' : '创新潜质奖学金'
}

// 检查奖学金类型冲突（异步版本）
// 返回 null 表示没有冲突，返回字符串表示已申请的奖学金类型名称
export const checkScholarshipConflict = async (targetType: ScholarshipType): Promise<string | null> => {
  const state = await getApplicationState()
  
  // 只有在已提交（锁定）状态下才检查冲突
  if (state.isLocked && state.scholarshipType && state.scholarshipType !== targetType) {
    return getScholarshipTypeName(state.scholarshipType)
  }
  
  return null
}