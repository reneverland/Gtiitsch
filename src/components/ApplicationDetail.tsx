import React, { useState } from 'react'
import JSZip from 'jszip'
import styles from './ApplicationDetail.module.css'

// dataUrl → Uint8Array（用于 JSZip 打包）
const dataUrlToUint8Array = (dataUrl: string): { bytes: Uint8Array; mime: string } | null => {
  if (!dataUrl || !dataUrl.startsWith('data:')) return null
  const [meta, base64] = dataUrl.split(',')
  if (!base64) return null
  const mimeMatch = meta.match(/data:([^;]+)/)
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return { bytes, mime }
}

// mime → 兜底扩展名
const mimeToExt = (mime: string): string => {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp',
    'application/pdf': 'pdf',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
  }
  return map[mime] || 'bin'
}

// 安全文件名：去除 Windows/Linux 不允许的字符
const sanitizeFileName = (name: string): string =>
  (name || '').replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_').slice(0, 80) || '未命名'

const NonImageAttachment: React.FC<{ file: any }> = ({ file }) => {
  const dataUrl: string = file?.dataUrl || ''
  const fileName: string = file?.name || '附件文件'

  const handlePreview = () => {
    if (!dataUrl) {
      alert('附件数据缺失，无法预览')
      return
    }
    try {
      const isDataUrl = dataUrl.startsWith('data:')
      if (isDataUrl) {
        const [meta, base64] = dataUrl.split(',')
        const mimeMatch = meta.match(/data:([^;]+)/)
        const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream'
        const binary = atob(base64)
        const len = binary.length
        const bytes = new Uint8Array(len)
        for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i)
        const blob = new Blob([bytes], { type: mime })
        const blobUrl = URL.createObjectURL(blob)
        window.open(blobUrl, '_blank')
      } else {
        window.open(dataUrl, '_blank')
      }
    } catch (e) {
      console.error('预览附件失败:', e)
      alert('预览失败，请尝试下载查看')
    }
  }

  const handleDownload = () => {
    if (!dataUrl) {
      alert('附件数据缺失，无法下载')
      return
    }
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ width: '100%', height: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: '6px', padding: '8px', border: '1px solid #e5e7eb' }}>
        <span style={{ fontSize: '32px', lineHeight: 1 }}>📄</span>
        <span style={{ fontSize: '12px', color: '#374151', marginTop: '6px', textAlign: 'center', wordBreak: 'break-all', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{fileName}</span>
      </div>
      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
        <button
          onClick={handlePreview}
          style={{ flex: 1, padding: '6px 8px', fontSize: '12px', background: '#0132b2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          👁️ 预览
        </button>
        <button
          onClick={handleDownload}
          style={{ flex: 1, padding: '6px 8px', fontSize: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          ⬇️ 下载
        </button>
      </div>
    </div>
  )
}

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

interface Props {
  application: Application
  onClose: () => void
  onApprove: (id: string, notes: string) => void
  onReject: (id: string, notes: string) => void
  isLoadingAttachments?: boolean
  loadAttachmentsError?: string | null
  onChangeScholarshipType?: (id: string, type: 'subject' | 'innovation') => Promise<void> | void
}

const ApplicationDetail: React.FC<Props> = ({ application, onClose, onApprove, onReject, isLoadingAttachments = false, loadAttachmentsError = null, onChangeScholarshipType }) => {
  const [notes, setNotes] = useState(application.notes || '')
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isExportingZip, setIsExportingZip] = useState(false)

  // 打包当前申请的所有附件为 zip：身份证、成绩表、竞赛证书_N、其他材料_N
  const handleExportZip = async () => {
    if (isLoadingAttachments) {
      alert('附件还在加载中，请稍候再试')
      return
    }
    const idCardLast4 = (application.idCard || '').slice(-4) || '0000'
    const folderName = sanitizeFileName(`${application.name || '未命名'}_${idCardLast4}`)
    const zip = new JSZip()
    const folder = zip.folder(folderName)
    if (!folder) { alert('打包失败：无法创建目录'); return }

    let count = 0
    const addFile = (file: any, label: string, idx?: number) => {
      if (!file || !file.dataUrl) return
      const parsed = dataUrlToUint8Array(file.dataUrl)
      if (!parsed) return
      const ext = (file.name && file.name.includes('.')) ? file.name.split('.').pop() : mimeToExt(parsed.mime)
      const baseName = idx != null ? `${label}_${idx}` : label
      const originalNameNoExt = (file.name || '').replace(/\.[^.]+$/, '')
      const finalName = originalNameNoExt
        ? sanitizeFileName(`${baseName}_${originalNameNoExt}`) + '.' + ext
        : sanitizeFileName(baseName) + '.' + ext
      folder.file(finalName, parsed.bytes)
      count++
    }

    setIsExportingZip(true)
    try {
      addFile(application.idCardAttachment, '身份证')
      addFile(application.scoreSheetAttachment, '高中成绩表')
      if (Array.isArray(application.competitionAttachments)) {
        application.competitionAttachments.forEach((f: any, i: number) => addFile(f, '竞赛证书', i + 1))
      }
      if (Array.isArray(application.otherAttachments)) {
        application.otherAttachments.forEach((f: any, i: number) => addFile(f, '其他材料', i + 1))
      }

      if (count === 0) {
        alert('该申请暂无可下载的附件')
        return
      }

      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = sanitizeFileName(`${application.name || '未命名'}_申请材料_${idCardLast4}`) + '.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    } catch (e) {
      console.error('打包失败:', e)
      alert('打包失败：' + (e as Error).message)
    } finally {
      setIsExportingZip(false)
    }
  }

  const handleApprove = () => {
    setIsProcessing(true)
    onApprove(application.id, notes)
  }

  const handleReject = () => {
    setIsProcessing(true)
    onReject(application.id, notes)
  }

  const formatScore = (score?: string, max?: string) => {
    if (!score) return '未填写'
    return max ? `${score}/${max}` : score
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>申请详情 - {application.name}</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>个人基本信息</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>姓名</span>
                <span className={styles.infoValue}>{application.name}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>身份证号</span>
                <span className={styles.infoValue}>{application.idCard}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>性别</span>
                <span className={styles.infoValue}>{application.gender || '未填写'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>姓（拼音）</span>
                <span className={styles.infoValue}>{application.familyName || '未填写'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>名字（拼音）</span>
                <span className={styles.infoValue}>{application.givenName || '未填写'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>民族</span>
                <span className={styles.infoValue}>{application.ethnicity || '未填写'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>出生日期</span>
                <span className={styles.infoValue}>{application.birthDate || '未填写'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>邮箱</span>
                <span className={styles.infoValue}>{application.email}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>选考科目</span>
                <span className={styles.infoValue}>{application.subjects || '未填写'}</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>就读信息</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>省份</span>
                <span className={styles.infoValue}>{application.schoolProvince || '未填写'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>城市</span>
                <span className={styles.infoValue}>{application.schoolCity || '未填写'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>高中学校</span>
                <span className={styles.infoValue}>{application.school}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>学校地址</span>
                <span className={styles.infoValue}>{application.schoolAddress || '未填写'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>班主任姓名</span>
                <span className={styles.infoValue}>{application.classTeacher || '未填写'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>班主任电话</span>
                <span className={styles.infoValue}>{application.classTeacherPhone || '未填写'}</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>家庭信息</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>家长姓名</span>
                <span className={styles.infoValue}>{application.parentName || '未填写'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>家长电话</span>
                <span className={styles.infoValue}>{application.parentPhone || '未填写'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>家庭地址</span>
                <span className={styles.infoValue}>{application.province} {application.address || '未填写'}</span>
              </div>
            </div>
          </div>

          {application.scholarshipType === 'subject' ? (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>竞赛获奖信息</h3>
              <div className={styles.infoGrid}>
                {application.competitionAwards && Array.isArray(application.competitionAwards) && application.competitionAwards.length > 0 ? (
                  application.competitionAwards.map((award: any, index: number) => (
                    <div key={index} style={{ gridColumn: '1 / -1', padding: '12px', background: '#f9fafb', borderRadius: '6px', marginBottom: '8px' }}>
                      <p style={{ fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>竞赛 {index + 1}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <p style={{ margin: '2px 0', fontSize: '13px' }}>竞赛名称：{award.name || '未填写'}</p>
                        <p style={{ margin: '2px 0', fontSize: '13px' }}>证书颁发单位：{award.issuer || '未填写'}</p>
                        <p style={{ margin: '2px 0', fontSize: '13px' }}>获奖时间：{award.awardTime || '未填写'}</p>
                        <p style={{ margin: '2px 0', fontSize: '13px' }}>获奖等级：{award.awardLevel || '未填写'}</p>
                        <p style={{ margin: '2px 0', fontSize: '13px' }}>是否在 gs.cyscc.org 公示：{award.isPublished || '未填写'}</p>
                        <p style={{ margin: '2px 0', fontSize: '13px' }}>公示链接：{award.publicLink || '未填写'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p style={{ color: '#9ca3af' }}>暂无竞赛获奖信息</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>考试成绩 - 考试一</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>考试名称</span>
                    <span className={styles.infoValue}>{application.examName || '未填写'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>总分</span>
                    <span className={styles.infoValue}>{formatScore(application.totalScore, application.totalScoreMax)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>语文</span>
                    <span className={styles.infoValue}>{formatScore(application.chinese, application.chineseMax)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>数学</span>
                    <span className={styles.infoValue}>{formatScore(application.math, application.mathMax)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>英语</span>
                    <span className={styles.infoValue}>{formatScore(application.english, application.englishMax)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>物理</span>
                    <span className={styles.infoValue}>{formatScore(application.physics, application.physicsMax)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>化学</span>
                    <span className={styles.infoValue}>{formatScore(application.chemistry, application.chemistryMax)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>年级排名</span>
                    <span className={styles.infoValue}>
                      {application.classRank || '未填写'} / {application.totalStudents || '未填写'}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>考试成绩 - 考试二</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>考试名称</span>
                    <span className={styles.infoValue}>{application.examName2 || '未填写'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>总分</span>
                    <span className={styles.infoValue}>{formatScore(application.totalScore2, application.totalScoreMax2)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>语文</span>
                    <span className={styles.infoValue}>{formatScore(application.chinese2, application.chineseMax2)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>数学</span>
                    <span className={styles.infoValue}>{formatScore(application.math2, application.mathMax2)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>英语</span>
                    <span className={styles.infoValue}>{formatScore(application.english2, application.englishMax2)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>物理</span>
                    <span className={styles.infoValue}>{formatScore(application.physics2, application.physicsMax2)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>化学</span>
                    <span className={styles.infoValue}>{formatScore(application.chemistry2, application.chemistryMax2)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>年级排名</span>
                    <span className={styles.infoValue}>
                      {application.classRank2 || '未填写'} / {application.totalStudents2 || '未填写'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 附件材料 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              申请材料附件
              {isLoadingAttachments && (
                <span style={{ marginLeft: '12px', fontSize: '13px', fontWeight: 'normal', color: '#0132b2' }}>
                  ⏳ 正在加载附件...
                </span>
              )}
              {loadAttachmentsError && (
                <span style={{ marginLeft: '12px', fontSize: '13px', fontWeight: 'normal', color: '#dc2626' }}>
                  ⚠️ {loadAttachmentsError}
                </span>
              )}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {application.idCardAttachment && (
                <div style={{ width: '200px' }}>
                  <p style={{ fontWeight: '500', marginBottom: '8px', fontSize: '13px' }}>身份证扫描件</p>
                  {application.idCardAttachment.type?.startsWith('image/') ? (
                    <img
                      src={application.idCardAttachment.dataUrl}
                      alt="身份证"
                      style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: '1px solid #e5e7eb' }}
                      onClick={() => setPreviewImage(application.idCardAttachment.dataUrl)}
                    />
                  ) : (
                    <NonImageAttachment file={application.idCardAttachment} />
                  )}
                </div>
              )}
              {application.scoreSheetAttachment && (
                <div style={{ width: '200px' }}>
                  <p style={{ fontWeight: '500', marginBottom: '8px', fontSize: '13px' }}>高中成绩表</p>
                  {application.scoreSheetAttachment.type?.startsWith('image/') ? (
                    <img
                      src={application.scoreSheetAttachment.dataUrl}
                      alt="成绩表"
                      style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: '1px solid #e5e7eb' }}
                      onClick={() => setPreviewImage(application.scoreSheetAttachment.dataUrl)}
                    />
                  ) : (
                    <NonImageAttachment file={application.scoreSheetAttachment} />
                  )}
                </div>
              )}
              {application.competitionAttachments && Array.isArray(application.competitionAttachments) && application.competitionAttachments.map((file: any, idx: number) => (
                <div key={`comp-${idx}`} style={{ width: '200px' }}>
                  <p style={{ fontWeight: '500', marginBottom: '8px', fontSize: '13px' }}>竞赛证书 {idx + 1}</p>
                  {file.type?.startsWith('image/') ? (
                    <img
                      src={file.dataUrl}
                      alt={`竞赛证书${idx + 1}`}
                      style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: '1px solid #e5e7eb' }}
                      onClick={() => setPreviewImage(file.dataUrl)}
                    />
                  ) : (
                    <NonImageAttachment file={file} />
                  )}
                </div>
              ))}
              {application.otherAttachments && Array.isArray(application.otherAttachments) && application.otherAttachments.map((file: any, idx: number) => (
                <div key={`other-${idx}`} style={{ width: '200px' }}>
                  <p style={{ fontWeight: '500', marginBottom: '8px', fontSize: '13px' }}>其他材料 {idx + 1}</p>
                  {file.type?.startsWith('image/') ? (
                    <img
                      src={file.dataUrl}
                      alt={`其他材料${idx + 1}`}
                      style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: '1px solid #e5e7eb' }}
                      onClick={() => setPreviewImage(file.dataUrl)}
                    />
                  ) : (
                    <NonImageAttachment file={file} />
                  )}
                </div>
              ))}
              {!application.idCardAttachment && !application.scoreSheetAttachment &&
               (!application.competitionAttachments || application.competitionAttachments.length === 0) &&
               (!application.otherAttachments || application.otherAttachments.length === 0) && (
                isLoadingAttachments ? (
                  <div style={{ width: '100%', padding: '24px', textAlign: 'center', color: '#0132b2', background: '#f0f4ff', borderRadius: '6px', border: '1px dashed #c7d2fe' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
                    <div style={{ fontSize: '14px' }}>正在加载申请材料附件，请稍候...</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>附件较大时可能需要几秒钟</div>
                  </div>
                ) : loadAttachmentsError ? (
                  <div style={{ width: '100%', padding: '24px', textAlign: 'center', color: '#dc2626', background: '#fef2f2', borderRadius: '6px', border: '1px dashed #fecaca' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</div>
                    <div style={{ fontSize: '14px' }}>附件加载失败：{loadAttachmentsError}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>请关闭后重试，或刷新页面</div>
                  </div>
                ) : (
                  <p style={{ color: '#9ca3af' }}>暂无附件材料</p>
                )
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>审核备注</h3>
            <textarea
              className={styles.textarea}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="请输入审核意见或备注..."
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnSecondary} onClick={onClose}>
            关闭
          </button>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleExportZip}
              disabled={isExportingZip || isLoadingAttachments}
              style={{
                padding: '10px 18px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px',
                cursor: (isExportingZip || isLoadingAttachments) ? 'not-allowed' : 'pointer',
                fontSize: '14px', fontWeight: 500,
                opacity: (isExportingZip || isLoadingAttachments) ? 0.6 : 1
              }}
              title={isLoadingAttachments ? '附件加载中，请稍候' : '将所有附件按申请人姓名打包为 zip 下载'}
            >
              {isExportingZip ? '📦 打包中...' : '📦 下载全部附件 (zip)'}
            </button>
            {application.scholarshipType === 'subject' && onChangeScholarshipType && (
              <button
                onClick={async () => {
                  if (!window.confirm(`确定将 ${application.name} 的申请由「学科特长奖」转为「创新潜质奖」吗？\n该操作仅修改奖学金类型，不影响附件与成绩数据。`)) return
                  try {
                    await onChangeScholarshipType(application.id, 'innovation')
                  } catch (e) {
                    console.error('转换失败:', e)
                  }
                }}
                style={{
                  padding: '10px 18px', background: '#0891b2', color: '#fff', border: 'none', borderRadius: '6px',
                  cursor: 'pointer', fontSize: '14px', fontWeight: 500
                }}
                title="将该申请的奖学金类型修改为「创新潜质奖」"
              >
                🔄 转为创新潜质奖
              </button>
            )}
            <button
              className={styles.btnDanger}
              onClick={handleReject}
              disabled={isProcessing}
            >
              {application.status === 'rejected' ? '保持拒绝' : '拒绝申请'}
            </button>
            <button
              className={styles.btnSuccess}
              onClick={handleApprove}
              disabled={isProcessing}
            >
              {application.status === 'approved' ? '保持通过' : '通过审核'}
            </button>
          </div>
        </div>
      </div>

      {previewImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          onClick={() => setPreviewImage(null)}
        >
          <img src={previewImage} alt="预览" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
        </div>
      )}
    </div>
  )
}

export default ApplicationDetail
