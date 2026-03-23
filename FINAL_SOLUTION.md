# 🔧 Network Error 最终解决方案

## 问题分析

Vercel Serverless 部署 Node.js Express 应用存在问题：
- ❌ 冷启动时间长
- ❌ 数据库连接超时
- ❌ 请求无响应

## ✅ 推荐方案：使用 Railway 部署后端

### 为什么选择 Railway
- ✅ 完整的 Node.js 环境（不是 Serverless）
- ✅ 支持长连接
- ✅ 自动 HTTPS
- ✅ 免费套餐：$5/月信用额度（够用）
- ✅ 部署简单，5 分钟搞定

### 详细步骤

#### 1. 访问 Railway
打开：https://railway.app

#### 2. 登录
使用 GitHub 账号登录（你已经登录了）

#### 3. 创建新项目
1. 点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 选择 `xtit/distribution-system` 仓库

#### 4. 配置服务
1. Railway 会自动识别 `backend` 目录
2. 如果没有，手动设置：
   - Settings → Root Directory: `backend`
   - Start Command: `node src/index.js`

#### 5. 添加环境变量
在 Railway 的 Variables 标签页添加：

```bash
DATABASE_URL=postgresql://postgres.kdpgnhpfkyugrlnpmtju:JgdDwJ9iK2Df8hdu@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
JWT_SECRET=51fd80b0b242824b750c231983b512ff1dc38f046c1da06206f4a54b70d35233
NODE_ENV=production
PORT=3010
```

#### 6. 等待部署
Railway 会自动构建和部署（约 2-3 分钟）

#### 7. 获取 API 地址
部署完成后，点击 "Settings" → "Domains"
你会看到一个公网 URL，例如：
```
https://distribution-system-production.up.railway.app
```

#### 8. 更新前端配置
编辑文件：`mobile-frontend/.env.production`
```bash
VITE_API_URL=https://distribution-system-production.up.railway.app
```

#### 9. 提交并部署前端
```bash
cd /home/admin/openclaw/workspace/distribution-system
git add -A
git commit -m "更新 API 地址到 Railway"
git push
```

Vercel 会自动重新部署前端

### 测试

#### 测试后端 API
```bash
curl https://your-railway-url.up.railway.app/health
```

#### 测试登录
```bash
curl -X POST https://your-railway-url.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

#### 测试前端
访问：https://distribution-system-psi.vercel.app

## 📊 项目最终架构

```
移动端前端 (Vercel)
https://distribution-system-psi.vercel.app
        ↓
后端 API (Railway)
https://xxx.up.railway.app
        ↓
数据库 (Supabase)
postgresql://...
```

## 🎯 优势

相比 Vercel Serverless：
- ✅ 没有冷启动
- ✅ 稳定的数据库连接
- ✅ 支持定时任务
- ✅ 完整的 Node.js 环境
- ✅ 更好的错误日志

## 💰 费用

- **Vercel**: 免费（前端托管）
- **Railway**: $5/月信用额度（后端托管，实际可能免费）
- **Supabase**: 免费（数据库）

总计：约 $0-5/月

---

**创建时间**: 2026-03-23 11:30
**推荐指数**: ⭐⭐⭐⭐⭐
**预计完成时间**: 10 分钟
