#!/bin/bash

echo "========================================"
echo "  CBIT-GTIITSch 奖学金申请系统"
echo "========================================"
echo ""

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    npm install
    echo ""
fi

# 启动服务
echo "🚀 启动开发服务器..."
echo ""
echo "✅ 后端 API 服务器: http://localhost:8500"
echo "✅ 前端开发服务器: http://localhost:3000"
echo ""
echo "📝 使用 Ctrl+C 停止服务器"
echo ""

npm run dev
