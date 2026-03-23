#!/bin/bash

# Railway 部署自动化脚本
# 使用方法：./deploy-to-railway.sh

echo "🚀 Railway 后端部署脚本"
echo "========================"
echo ""

# 检查 Railway CLI 是否安装
if ! command -v railway &> /dev/null
then
    echo "❌ Railway CLI 未安装，正在安装..."
    npm install -g @railway/cli
fi

# 登录 Railway
echo ""
echo "📝 请登录 Railway..."
railway login

# 初始化项目
echo ""
echo "📦 初始化 Railway 项目..."
railway init --workspace 5695b3b9-7af4-4620-8897-1e2c6112fe08

# 进入 backend 目录
cd backend

# 链接项目
echo ""
echo "🔗 链接 Railway 项目..."
railway link

# 设置 Root Directory
echo ""
echo "⚙️  设置 Root Directory..."
railway namespace set --root backend

# 添加环境变量
echo ""
echo "🔑 添加环境变量..."
railway variables set \
  DATABASE_URL="postgresql://postgres.kdpgnhpfkyugrlnpmtju:JgdDwJ9iK2Df8hdu@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres" \
  JWT_SECRET="51fd80b0b242824b750c231983b512ff1dc38f046c1da06206f4a54b70d35233" \
  NODE_ENV="production" \
  PORT="3010"

# 部署
echo ""
echo "🚀 开始部署..."
railway up --prod

# 获取项目 URL
echo ""
echo "🌐 获取项目 URL..."
railway domain

echo ""
echo "✅ 部署完成！"
echo ""
echo "📋 下一步："
echo "1. 复制上面显示的 Railway URL"
echo "2. 更新 mobile-frontend/.env.production 中的 VITE_API_URL"
echo "3. 提交并推送代码：git add -A && git commit -m '更新 API 地址' && git push"
echo ""
