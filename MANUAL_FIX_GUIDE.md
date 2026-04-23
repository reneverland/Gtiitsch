# 手动修复指南 - PDF中文乱码问题

## 问题说明

当前PDF生成使用jsPDF库，默认不支持中文，导致下载的成绩单出现乱码。

## 解决方案

将PDF生成改为HTML打印方式，让浏览器处理中文显示和PDF转换。

## 修改步骤

### 1. 打开文件
```bash
nano /www/wwwroot/CBIT-GTIITSch/src/pages/StudentApplication.tsx
```

### 2. 找到 handleDownloadScoreSheet 函数

搜索（Ctrl+W）: `const handleDownloadScoreSheet`

该函数大约在第998行，从：
```typescript
const handleDownloadScoreSheet = () => {
  if (!window.confirm('成绩单导出后...
```

到第1152行：
```typescript
    }
  }
```

### 3. 完整替换该函数

**删除第998-1152行的所有内容**，替换为以下代码：

```typescript
  // 下载成绩单（HTML打印版本，避免PDF中文乱码）
  const handleDownloadScoreSheet = () => {
    if (!window.confirm('成绩单导出后，所填写的高三成绩将不可更改，请再次确认所填成绩无误。确定下载吗？')) {
      return
    }
    
    // 检查必填字段
    const required = [
      { field: 'province', label: '省份' },
      { field: 'name', label: '姓名' },
      { field: 'parentPhone', label: '联系电话' },
      { field: 'idCard', label: '身份证号' },
      { field: 'school', label: '就读中学' },
      { field: 'subjects', label: '科类' },
      { field: 'schoolAddress', label: '中学地址' },
      { field: 'examName', label: '考试一名称' },
      { field: 'totalScore', label: '考试一总分' },
      { field: 'examName2', label: '考试二名称' },
      { field: 'totalScore2', label: '考试二总分' }
    ]
    
    for (const item of required) {
      if (!formData[item.field as keyof typeof formData] || 
          formData[item.field as keyof typeof formData].toString().trim() === '') {
        alert(`请先填写"${item.label}"`)
        return
      }
    }
    
    try {
      // 生成HTML内容用于打印
      const printWindow = window.open('', '_blank', 'width=1200,height=800')
      if (!printWindow) {
        alert('请允许浏览器弹出窗口')
        return
      }
      
      const htmlContent = \`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>2026年博文奖学金申请者高中成绩表</title>
  <style>
    @media print {
      @page {
        size: A4 landscape;
        margin: 15mm;
      }
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print {
        display: none;
      }
    }
    body {
      font-family: "SimSun", "宋体", "Microsoft YaHei", sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      max-width: 1200px;
      margin: 0 auto;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    h1 {
      text-align: center;
      font-size: 22px;
      margin-bottom: 25px;
      font-weight: bold;
      color: #333;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      border: 1px solid #000;
      padding: 10px 8px;
      text-align: center;
      font-size: 12px;
    }
    th {
      background-color: #f0f0f0;
      font-weight: bold;
    }
    .info-label {
      font-weight: bold;
      background-color: #f8f8f8;
      width: 100px;
    }
    .section-title {
      font-weight: bold;
      margin: 20px 0 10px;
      font-size: 15px;
    }
    .footer {
      margin-top: 25px;
      font-size: 12px;
    }
    .signature {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }
    .note {
      margin-top: 25px;
      font-size: 11px;
      color: #666;
    }
    .btn-container {
      text-align: center;
      margin: 20px 0;
      padding: 20px;
      background: #e3f2fd;
      border-radius: 8px;
    }
    .btn-print {
      background: #1976d2;
      color: white;
      border: none;
      padding: 12px 30px;
      font-size: 16px;
      border-radius: 5px;
      cursor: pointer;
      margin: 0 10px;
    }
    .btn-print:hover {
      background: #1565c0;
    }
    .instructions {
      background: #fff3cd;
      padding: 15px;
      margin-bottom: 20px;
      border-left: 4px solid #ffc107;
      font-size: 13px;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="instructions no-print">
      <strong>📢 使用说明：</strong><br>
      1. 点击下方"打印/保存为PDF"按钮<br>
      2. 在打印对话框中选择"另存为PDF"或直接打印<br>
      3. 打印后请加盖学校公章，然后扫描上传
    </div>

    <div class="btn-container no-print">
      <button class="btn-print" onclick="window.print()">🖨️ 打印/保存为PDF</button>
      <button class="btn-print" onclick="window.close()" style="background: #757575;">关闭</button>
    </div>

    <h1>2026年博文奖学金申请者高中成绩表（个人申报）</h1>
    
    <table>
      <thead>
        <tr>
          <th colspan="8">基本信息</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="info-label">省份</td>
          <td>\${formData.province || ''}</td>
          <td class="info-label">学生姓名</td>
          <td>\${formData.name || ''}</td>
          <td class="info-label">联系电话</td>
          <td>\${formData.parentPhone || ''}</td>
          <td class="info-label">学生身份证号</td>
          <td>\${formData.idCard || ''}</td>
        </tr>
        <tr>
          <td class="info-label">就读中学</td>
          <td colspan="2">\${formData.school || ''}</td>
          <td class="info-label">科类</td>
          <td>\${formData.subjects === '物理+化学' ? '理科' : '文科'}</td>
          <td class="info-label">中学详细地址</td>
          <td colspan="2">\${formData.schoolAddress || ''}</td>
        </tr>
      </tbody>
    </table>
    
    <div class="section-title">高三成绩</div>
    
    <table>
      <thead>
        <tr>
          <th style="width: 120px;">考试名称</th>
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
          <th style="width: 80px;">年级排名</th>
          <th style="width: 100px;">全年级总人数</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>\${formData.examName || ''}</td>
          <td>\${formData.chinese && formData.chineseMax ? \`\${formData.chinese}/\${formData.chineseMax}\` : (formData.chinese || '')}</td>
          <td>\${formData.math && formData.mathMax ? \`\${formData.math}/\${formData.mathMax}\` : (formData.math || '')}</td>
          <td>\${formData.english && formData.englishMax ? \`\${formData.english}/\${formData.englishMax}\` : (formData.english || '')}</td>
          <td>\${formData.physics && formData.physicsMax ? \`\${formData.physics}/\${formData.physicsMax}\` : (formData.physics || '')}</td>
          <td>\${formData.chemistry && formData.chemistryMax ? \`\${formData.chemistry}/\${formData.chemistryMax}\` : (formData.chemistry || '')}</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td>\${formData.totalScore && formData.totalScoreMax ? \`\${formData.totalScore}/\${formData.totalScoreMax}\` : (formData.totalScore || '')}</td>
          <td>\${formData.classRank || ''}</td>
          <td>\${formData.totalStudents || ''}</td>
        </tr>
        <tr>
          <td>\${formData.examName2 || ''}</td>
          <td>\${formData.chinese2 && formData.chineseMax2 ? \`\${formData.chinese2}/\${formData.chineseMax2}\` : (formData.chinese2 || '')}</td>
          <td>\${formData.math2 && formData.mathMax2 ? \`\${formData.math2}/\${formData.mathMax2}\` : (formData.math2 || '')}</td>
          <td>\${formData.english2 && formData.englishMax2 ? \`\${formData.english2}/\${formData.englishMax2}\` : (formData.english2 || '')}</td>
          <td>\${formData.physics2 && formData.physicsMax2 ? \`\${formData.physics2}/\${formData.physicsMax2}\` : (formData.physics2 || '')}</td>
          <td>\${formData.chemistry2 && formData.chemistryMax2 ? \`\${formData.chemistry2}/\${formData.chemistryMax2}\` : (formData.chemistry2 || '')}</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td>\${formData.totalScore2 && formData.totalScoreMax2 ? \`\${formData.totalScore2}/\${formData.totalScoreMax2}\` : (formData.totalScore2 || '')}</td>
          <td>\${formData.classRank2 || ''}</td>
          <td>\${formData.totalStudents2 || ''}</td>
        </tr>
        \${[...Array(5)].map(() => \`
        <tr>
          <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
          <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
        </tr>\`).join('')}
      </tbody>
    </table>
    
    <div class="footer">
      <div>中学确认以上所填内容真实有效</div>
      <div class="signature">
        <div>中学审核人签字：_________________</div>
        <div>中学公章（盖章）</div>
      </div>
    </div>
    
    <div class="note">
      *此成绩表为广东以色列理工学院奖学金申请专用，请务必加盖公章后以图片格式上传！
    </div>
  </div>
</body>
</html>
      \`
      
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      alert('✅ 打印窗口已打开！\\n\\n请在打印对话框中：\\n1. 选择"另存为PDF"保存文件，或\\n2. 直接打印纸质版\\n\\n保存/打印后，请加盖学校公章，然后扫描上传。')
    } catch (error) {
      console.error('生成成绩单失败:', error)
      alert('生成成绩单失败，请检查填写内容是否完整')
    }
  }
```

### 4. 保存文件
- 按 Ctrl+O 保存
- 按 Ctrl+X 退出

### 5. 重新构建
```bash
sudo pkill -f "node server/index.js"
sudo rm -rf /www/wwwroot/CBIT-GTIITSch/dist
cd /www/wwwroot/CBIT-GTIITSch
npm run build
nohup node server/index.js > /tmp/cbit-server.log 2>&1 &
```

## 效果对比

**修改前：**
- 点击"下载成绩单"→ 生成PDF文件
- PDF中中文显示为乱码（□□□）

**修改后：**
- 点击"下载成绩单模板"→ 打开新窗口显示HTML表格
- 点击"打印/保存为PDF"→ 浏览器打印对话框
- 选择"另存为PDF"→ 保存为完美支持中文的PDF文件

## 注意事项

1. HTML模板字符串使用反引号（\`），不要用单引号或双引号
2. 模板字符串中的变量使用 \${} 语法
3. 注意转义字符：\\n \\t 等需要双反斜杠
4. 确保没有语法错误后再保存

## 验证

修改后测试：
1. 登录系统
2. 填写高中成绩
3. 点击"下载成绩单模板"
4. 应该弹出新窗口，显示完整的中文成绩表
5. 点击窗口中的"打印/保存为PDF"
6. 保存的PDF文件中中文应该正常显示

---
**修改完成后，所有4个问题将全部解决！** 🎉
