# 广东以色列理工学院奖学金申请系统 - 技术规划文档

---

## 1. 组件清单

### shadcn/ui 内置组件
| 组件 | 用途 | 安装命令 |
|------|------|----------|
| Button | 所有按钮 | `npx shadcn add button` |
| Card | 奖学金卡片、注册卡片 | `npx shadcn add card` |
| Input | 表单输入框 | `npx shadcn add input` |
| Label | 表单标签 | `npx shadcn add label` |
| Dialog | 登录弹窗 | `npx shadcn add dialog` |
| Tabs | 登录/注册切换 | `npx shadcn add tabs` |
| Separator | 分割线 | `npx shadcn add separator` |
| Badge | 标签 | `npx shadcn add badge` |

### 自定义组件
| 组件 | 用途 | 位置 |
|------|------|------|
| Header | 导航栏 | `src/components/Header.tsx` |
| Footer | 页脚 | `src/components/Footer.tsx` |
| LoginModal | 登录弹窗 | `src/components/LoginModal.tsx` |
| ScholarshipCard | 奖学金卡片 | `src/components/ScholarshipCard.tsx` |
| ProcessStep | 流程步骤 | `src/components/ProcessStep.tsx` |
| ContactItem | 联系项 | `src/components/ContactItem.tsx` |
| AnimatedSection | 滚动动画包装器 | `src/components/AnimatedSection.tsx` |

---

## 2. 动画实现方案

| 动画 | 库 | 实现方式 | 复杂度 |
|------|-----|----------|--------|
| 页面加载淡入 | Framer Motion | `motion.div` + `initial/animate` | 低 |
| 滚动触发显示 | Framer Motion | `whileInView` + `viewport` | 低 |
| 卡片悬停上浮 | Framer Motion | `whileHover` + `transition` | 低 |
| 按钮悬停效果 | Tailwind CSS | `hover:translate-y hover:shadow-lg` | 低 |
| 弹窗打开/关闭 | Framer Motion | `AnimatePresence` + `motion.div` | 中 |
| 步骤依次显示 | Framer Motion | `staggerChildren` + `delayChildren` | 中 |
| 输入框聚焦 | Tailwind CSS | `focus:ring focus:border-blue-500` | 低 |
| 标签页切换 | Framer Motion | `layout` + `motion.div` | 低 |

### 动画库选择
- **Framer Motion**: 主要动画库，用于所有React组件动画
- **Tailwind CSS**: 简单悬停效果

---

## 3. 项目文件结构

```
/mnt/okcomputer/output/app/
├── public/
│   ├── logo.png              # 学校Logo
│   ├── hero-bg.png           # Hero背景装饰
│   ├── icon-trophy.png       # 学科特长图标
│   ├── icon-bulb.png         # 创新潜质图标
│   └── icons/                # 流程图标
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── LoginModal.tsx
│   │   ├── ScholarshipCard.tsx
│   │   ├── ProcessStep.tsx
│   │   ├── ContactItem.tsx
│   │   └── AnimatedSection.tsx
│   ├── pages/
│   │   ├── Home.tsx          # 首页
│   │   └── Register.tsx      # 注册页
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── ScholarshipSection.tsx
│   │   ├── ProcessSection.tsx
│   │   ├── ContactSection.tsx
│   │   └── LoginEntrySection.tsx
│   ├── hooks/
│   │   └── useScrollAnimation.ts
│   ├── lib/
│   │   └── utils.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 4. 依赖清单

### 核心依赖（已包含）
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

### 额外依赖
```bash
npm install framer-motion lucide-react
```

---

## 5. 路由规划

| 路由 | 页面 | 描述 |
|------|------|------|
| `/` | Home | 首页（奖学金介绍） |
| `/register` | Register | 注册页面 |

---

## 6. 颜色配置 (tailwind.config.js)

```javascript
colors: {
  primary: {
    DEFAULT: '#1e40af',
    dark: '#1e3a8a',
    light: '#3b82f6',
  },
  gold: {
    DEFAULT: '#f59e0b',
    dark: '#d97706',
  },
  cyan: {
    DEFAULT: '#0891b2',
    dark: '#0e7490',
  },
}
```

---

## 7. 开发顺序

1. 初始化项目
2. 安装依赖和组件
3. 配置Tailwind颜色
4. 创建通用组件（Header, Footer, AnimatedSection）
5. 创建首页各Section
6. 创建登录弹窗
7. 创建注册页面
8. 配置路由
9. 添加动画效果
10. 测试和优化
11. 构建和部署

---
