import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'

// 自定义插件：构建时复制 source 目录到 dist
function copySourcePlugin() {
  return {
    name: 'copy-source-directory',
    writeBundle() {
      try {
        const sourceDir = join(__dirname, 'source')
        const distSourceDir = join(__dirname, 'dist', 'source')
        
        // 创建 dist/source 目录
        if (!existsSync(distSourceDir)) {
          mkdirSync(distSourceDir, { recursive: true })
        }
        
        // 复制 source 目录中的所有文件（仅PNG和JPG图片）
        if (existsSync(sourceDir)) {
          const files = readdirSync(sourceDir)
          files.forEach(file => {
            // 只复制图片文件
            if (file.match(/\.(png|jpg|jpeg)$/i)) {
              const srcFile = join(sourceDir, file)
              const destFile = join(distSourceDir, file)
              try {
                copyFileSync(srcFile, destFile)
                console.log(`✅ 已复制: ${file} -> dist/source/`)
              } catch (err: any) {
                // 忽略权限错误，不影响构建
                console.warn(`⚠️  复制失败: ${file} (${err.code || err.message})`)
              }
            }
          })
        }
      } catch (err) {
        // 插件出错不应该导致整个构建失败
        console.warn('⚠️  copySourcePlugin 出错:', err)
      }
    }
  }
}

export default defineConfig({
  plugins: [react(), copySourcePlugin()],
  server: {
    port: 3000,
    host: '0.0.0.0',  // 允许外部访问
    allowedHosts: [
      'llmhi.com',
      '.llmhi.com'  // 允许所有子域名
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8500',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist'
  }
})


