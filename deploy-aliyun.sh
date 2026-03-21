#!/bin/bash

# 阿里云服务器部署脚本
# 使用方法：./deploy-to-aliyun.sh

set -e

# ========== 配置区域 ==========
SERVER_IP="你的服务器 IP"
SERVER_USER="root"
SERVER_PORT="22"
DEPLOY_DIR="/var/www/distribution-system"
APP_NAME="distribution-backend"

# ========== 颜色定义 ==========
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ========== 函数定义 ==========

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

check_server() {
    log_info "检查服务器连接..."
    if ping -c 1 $SERVER_IP > /dev/null 2>&1; then
        log_success "服务器连接正常"
    else
        log_error "无法连接到服务器 $SERVER_IP"
        exit 1
    fi
}

init_server() {
    log_info "初始化服务器环境..."
    
    ssh -p $SERVER_PORT ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
        # 更新系统
        apt update && apt upgrade -y
        
        # 安装必要工具
        apt install -y curl git wget
        
        # 安装 Node.js 20.x
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt install -y nodejs
        
        # 安装 PM2
        npm install -g pm2
        
        # 创建应用目录
        mkdir -p /var/www/distribution-system
        chown -R $USER:$USER /var/www/distribution-system
        
        # 配置防火墙
        ufw allow 22
        ufw allow 3010
        ufw --force enable
        
        log_success "服务器初始化完成"
ENDSSH
}

deploy_backend() {
    log_info "部署后端服务..."
    
    # 打包后端代码
    cd backend
    tar -czf ../backend.tar.gz \
        --exclude='node_modules' \
        --exclude='data/*.db' \
        --exclude='uploads/*' \
        --exclude='qrcodes/*' \
        --exclude='.env' \
        .
    cd ..
    
    # 上传到服务器
    log_info "上传后端代码..."
    scp -P $SERVER_PORT backend.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/
    
    # 远程部署
    ssh -p $SERVER_PORT ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
        cd /var/www/distribution-system
        
        # 解压
        tar -xzf /tmp/backend.tar.gz
        rm /tmp/backend.tar.gz
        
        # 安装依赖
        cd backend
        npm install --production
        
        # 创建 .env 文件
        if [ ! -f .env ]; then
            cat > .env << 'ENVEOF'
PORT=3010
NODE_ENV=production
DATABASE_PATH=./data/production.db
JWT_SECRET=your-secret-key-change-this-in-production
ENVEOF
            log_warning "已创建 .env 文件，请手动修改 JWT_SECRET"
        fi
        
        # 初始化数据库
        if [ ! -f data/production.db ]; then
            node src/scripts/init-db.js
            log_success "数据库初始化完成"
        fi
        
        # 重启服务
        pm2 delete $APP_NAME 2>/dev/null || true
        pm2 start src/index.js --name $APP_NAME
        pm2 save
        pm2 startup | tail -1 | bash
        
        log_success "后端部署完成"
ENDSSH
}

build_frontend() {
    log_info "构建前端..."
    
    cd mobile-frontend
    
    # 创建生产环境配置
    cat > .env.production << EOF
VITE_API_BASE=http://${SERVER_IP}:3010/api
EOF
    
    # 安装依赖并构建
    npm install
    npm run build
    
    log_success "前端构建完成：mobile-frontend/dist/"
    
    cd ..
}

deploy_frontend_cloudflare() {
    log_info "部署前端到 Cloudflare Pages..."
    
    cat << EOF

${YELLOW}========== Cloudflare Pages 部署指南 ==========${NC}

1. 访问 https://pages.cloudflare.com 并登录

2. 点击 "Create a project"

3. 选择 "Direct Upload"

4. 上传文件夹:
   ${GREEN}/home/admin/openclaw/workspace/distribution-system/mobile-frontend/dist${NC}

5. 设置项目名称：distribution-frontend

6. 点击 "Deploy"

部署完成后你将获得:
  前端地址：https://distribution-frontend.pages.dev

${YELLOW}==========================================${NC}

EOF
}

test_deployment() {
    log_info "测试部署..."
    
    # 测试后端
    sleep 5
    if curl -s http://${SERVER_IP}:3010/health | grep -q "ok"; then
        log_success "后端服务正常"
    else
        log_error "后端服务异常"
    fi
    
    # 显示访问信息
    cat << EOF

${GREEN}========== 部署完成！==========${NC}

后端 API: http://${SERVER_IP}:3010/api
前端地址: (部署到 Cloudflare 后获得)

${YELLOW}下一步:${NC}
1. 按照上面的指南部署前端到 Cloudflare Pages
2. 访问前端地址测试功能
3. 修改 .env 文件中的 JWT_SECRET（重要！）
4. 配置域名和 HTTPS（可选）

${YELLOW}================================${NC}

EOF
}

# ========== 主流程 ==========

main() {
    cat << EOF

${BLUE}╔════════════════════════════════════════╗${NC}
${BLUE}║   阿里云服务器部署脚本                ║${NC}
${BLUE}╚════════════════════════════════════════╝${NC}

服务器：${SERVER_USER}@${SERVER_IP}:${SERVER_PORT}
部署目录：${DEPLOY_DIR}

EOF

    # 询问是否继续
    read -p "是否继续部署？[y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "部署已取消"
        exit 0
    fi
    
    # 执行部署
    check_server
    init_server
    deploy_backend
    build_frontend
    deploy_frontend_cloudflare
    test_deployment
    
    log_success "🎉 所有部署步骤完成！"
}

# 运行主函数
main
