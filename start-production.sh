#!/bin/bash

echo "========================================"
echo "  启动 CBIT-GTIITSch 奖学金系统"
echo "  单端口模式 (8500)"
echo "========================================"
echo ""

# 构建前端
echo "📦 构建前端..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 前端构建失败"
    exit 1
fi

echo "✅ 前端构建完成"
echo ""

# 启动服务器
echo "🚀 启动服务器 (8500端口)..."
echo ""

node server/index.js
