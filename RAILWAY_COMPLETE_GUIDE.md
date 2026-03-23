# 🚀 Railway 后端部署完整指南

## ✅ 前置准备

你已经完成了：
- ✅ Railway 账号已登录
- ✅ GitHub 账号已关联

## 📋 部署步骤（10 分钟）

### 步骤 1: 创建新项目

1. 访问：https://railway.app/dashboard
2. 点击 **"New"** 按钮（页面顶部）
3. 选择 **"Deploy from GitHub repo"**

### 步骤 2: 选择仓库

1. 在 GitHub 授权页面，允许 Railway 访问你的 GitHub
2. 找到并选择 `xtit/distribution-system` 仓库
3. 点击 **"Deploy Now"**

### 步骤 3: 配置服务

Railway 会自动开始部署，但需要手动配置：

1. 在 Railway Dashboard 中找到刚创建的服务
2. 点击 **"Settings"** 标签页
3. 找到 **"Root Directory"** 字段
4. 输入：`backend`
5. 点击 **"Save"**

### 步骤 4: 添加环境变量（重要！）

1. 点击 **"Variables"** 标签页
2. 点击 **"New Variable"** 或 **"Add Variable"**
3. 依次添加以下变量：

#### 变量 1: DATABASE_URL
```
Name: DATABASE_URL
Value: postgresql://postgres.kdpgnhpfkyugrlnpmtju:JgdDwJ9iK2Df8hdu@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
```

#### 变量 2: JWT_SECRET
```
Name: JWT_SECRET
Value: 51fd80b0b242824b750c231983b512ff1dc38f046c1da06206f4a54b70d35233
```

#### 变量 3: NODE_ENV
```
Name: NODE_ENV
Value: production
```

#### 变量 4: PORT
```
Name: PORT
Value: 3010
```

### 步骤 5: 等待部署完成

1. Railway 会自动重新部署（约 2-3 分钟）
2. 在 **"Deployments"** 标签页查看部署日志
3. 等待看到 **"SUCCESS"** 或 **"Running"** 状态

### 步骤 6: 获取 API 地址

1. 部署成功后，点击 **"Settings"** 标签页
2. 找到 **"Domains"** 或 **"Public Networking"** 部分
3. 你会看到一个 URL，格式类似：
   ```
   https://distribution-system-production.up.railway.app
   ```
4. **复制这个 URL**

### 步骤 7: 测试后端 API

在浏览器中访问：
```
https://your-railway-url.up.railway.app/health
```

应该看到：
```json
{
  "status": "ok",
  "timestamp": "2026-03-23T..."
}
```

### 步骤 8: 更新前端配置

1. 编辑文件：`mobile-frontend/.env.production`
2. 修改为：
   ```
   VITE_API_URL=https://your-railway-url.up.railway.app
   ```
   （替换为你的 Railway URL）

3. 保存文件

### 步骤 9: 提交并部署前端

```bash
cd /home/admin/openclaw/workspace/distribution-system
git add -A
git commit -m "更新 API 地址到 Railway"
git push
```

Vercel 会自动重新部署前端（约 1-2 分钟）

### 步骤 10: 完整测试

#### 1. 测试后端
```bash
# 健康检查
curl https://your-railway-url.up.railway.app/health

# 登录测试
curl -X POST https://your-railway-url.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

#### 2. 测试前端
访问：https://distribution-system-psi.vercel.app
- 使用 admin / admin123 登录
- 应该不再出现 Network Error

## 🎯 成功标志

- ✅ Railway 部署状态显示 "Running"
- ✅ /health 接口返回成功
- ✅ 登录接口返回 token
- ✅ 前端可以正常登录

## 🔧 故障排查

### 问题 1: 部署失败
- 检查 Root Directory 是否设置为 `backend`
- 检查 package.json 是否在 backend 目录中
- 查看部署日志中的错误信息

### 问题 2: 数据库连接失败
- 检查 DATABASE_URL 是否正确
- 确认 Supabase 项目已创建
- 确认数据库表已初始化

### 问题 3: 前端仍然 Network Error
- 清除浏览器缓存
- 确认 .env.production 已更新
- 确认前端已重新部署

## 📊 最终架构

```
用户
  ↓
移动端前端 (Vercel)
https://distribution-system-psi.vercel.app
  ↓
后端 API (Railway)
https://xxx.up.railway.app
  ↓
数据库 (Supabase)
postgresql://...
```

## 💰 费用说明

- **Vercel**: 免费（前端）
- **Railway**: $5 信用额度/月（后端，实际可能免费）
- **Supabase**: 免费（数据库）

总计：约 $0-5/月

---

**创建时间**: 2026-03-23 11:55
**预计完成时间**: 10 分钟
**难度**: ⭐⭐☆☆☆
