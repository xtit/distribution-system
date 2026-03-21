#!/bin/bash

# Vercel + Supabase 快速部署脚本
# 使用方法：./deploy-vercel.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Node.js
check_node() {
    if ! command -v node &> /dev/null; then
        log_error "未安装 Node.js，请先安装 Node.js"
        exit 1
    fi
    log_success "Node.js 已安装：$(node -v)"
}

# 检查 Vercel CLI
check_vercel() {
    if ! command -v vercel &> /dev/null; then
        log_info "安装 Vercel CLI..."
        npm install -g vercel
    fi
    log_success "Vercel CLI 已安装：$(vercel -v)"
}

# 初始化 Git
init_git() {
    if [ ! -d ".git" ]; then
        log_info "初始化 Git 仓库..."
        git init
        git add .
        git commit -m "Initial commit"
        log_success "Git 仓库初始化完成"
    else
        log_info "Git 仓库已存在"
    fi
}

# 部署后端
deploy_backend() {
    log_info "部署后端到 Vercel..."
    
    cd backend
    
    # 首次部署
    if [ ! -f .vercel ]; then
        vercel --yes
    fi
    
    # 添加环境变量
    log_warning "请手动添加环境变量 DATABASE_URL"
    echo "访问：https://vercel.com/dashboard"
    echo "进入项目 → Settings → Environment Variables"
    echo "添加：DATABASE_URL = postgresql://..."
    
    # 生产部署
    vercel --prod
    
    cd ..
    
    log_success "后端部署完成"
}

# 部署前端
deploy_frontend() {
    log_info "部署前端到 Vercel..."
    
    cd mobile-frontend
    
    # 构建
    npm install
    npm run build
    
    # 部署
    if [ ! -f .vercel ]; then
        vercel --yes
    fi
    
    vercel --prod
    
    cd ..
    
    log_success "前端部署完成"
}

# 显示部署信息
show_info() {
    cat << EOF

${GREEN}========== 部署完成！==========${NC}

${YELLOW}下一步操作:${NC}

1. 创建 Supabase 数据库
   访问：https://supabase.com/new
   Region 选择：Tokyo (日本)

2. 获取数据库连接字符串
   Settings → Database → Connection string
   格式：postgresql://postgres:密码@xxx.supabase.co:5432/postgres

3. 在 Vercel 添加环境变量
   访问：https://vercel.com/dashboard
   进入项目 → Settings → Environment Variables
   添加：
   - DATABASE_URL (PostgreSQL 连接字符串)
   - JWT_SECRET (随机字符串)

4. 重新部署
   cd backend && vercel --prod
   cd mobile-frontend && vercel --prod

5. 测试访问
   前端：https://你的项目.vercel.app
   后端：https://你的项目.vercel.app/api

${GREEN}================================${NC}

EOF
}

# 主函数
main() {
    cat << EOF

${BLUE}╔════════════════════════════════════════╗${NC}
${BLUE}║   Vercel + Supabase 部署脚本           ║${NC}
${BLUE}╚════════════════════════════════════════╝${NC}

EOF

    check_node
    check_vercel
    init_git
    
    log_warning "请确保:"
    echo "1. 已注册 Vercel 账号 (https://vercel.com)"
    echo "2. 已注册 Supabase 账号 (https://supabase.com)"
    echo ""
    
    read -p "是否继续部署？[y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "部署已取消"
        exit 0
    fi
    
    deploy_backend
    deploy_frontend
    show_info
    
    log_success "🎉 所有步骤完成！"
}

# 运行
main
