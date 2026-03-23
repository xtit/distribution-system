# 🚀 使用 Railway 部署后端（推荐方案）

## 为什么使用 Railway

- ✅ 完整的 Node.js 环境（不是 Serverless）
- ✅ 支持长连接和定时任务
- ✅ 自动 HTTPS
- ✅ 免费套餐够用
- ✅ 部署简单

## 部署步骤

### 1. 访问 Railway
打开：https://railway.app

### 2. 登录
使用 GitHub 账号登录

### 3. 创建新项目
1. 点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 选择 `xtit/distribution-system` 仓库

### 4. 配置后端服务
1. 在 Railway Dashboard 中找到 `backend` 服务
2. 点击 "Settings"
3. 设置 Root Directory: `backend`

### 5. 添加环境变量
在 Railway 的 Variables 中添加：

```
DATABASE_URL=postgresql://postgres.kdpgnhpfkyugrlnpmtju:JgdDwJ9iK2Df8hdu@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
JWT_SECRET=51fd80b0b242824b750c231983b512ff1dc38f046c1da06206f4a54b70d35233
NODE_ENV=production
PORT=3010
```

### 6. 等待部署完成
Railway 会自动构建和部署

### 7. 获取 API 地址
部署完成后，Railway 会提供一个公网 URL，例如：
```
https://distribution-system-production.up.railway.app
```

### 8. 更新前端配置
更新 `mobile-frontend/.env.production`:
```
VITE_API_URL=https://distribution-system-production.up.railway.app
```

### 9. 重新部署前端
```bash
cd /home/admin/openclaw/workspace/distribution-system
git add -A
git commit -m "更新 API 地址到 Railway"
git push
```

## 测试

### 测试后端 API
```bash
curl https://distribution-system-production.up.railway.app/health
```

### 测试登录
```bash
curl -X POST https://distribution-system-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 优势

相比 Vercel Serverless：
- ✅ 没有冷启动
- ✅ 支持 WebSocket
- ✅ 支持定时任务
- ✅ 更稳定的数据库连接
- ✅ 完整的 Node.js 环境

---

**创建时间**: 2026-03-23 11:27
**推荐指数**: ⭐⭐⭐⭐⭐
