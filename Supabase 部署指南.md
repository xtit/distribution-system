# Supabase + Vercel 后端部署快速指南

## 📋 步骤 1: 创建 Supabase 数据库

1. 访问：https://supabase.com/dashboard
2. 点击 "Start your project" 或 "New project"
3. 填写项目信息：
   - **Name**: `distribution-system`
   - **Database Password**: 生成一个强密码（保存好！）
   - **Region**: 选择离你最近的（推荐 `East Asia (Tokyo)`）
4. 点击 "Create new project"
5. 等待 2-3 分钟数据库创建完成

## 📋 步骤 2: 获取数据库连接字符串

1. 进入项目 Dashboard
2. 点击左侧 **Settings** (齿轮图标)
3. 点击 **Database**
4. 找到 **Connection string** 部分
5. 选择 **Pooler** 模式（重要！）
6. 复制连接字符串，格式如下：
   ```
   postgresql://postgres.xxx:your-password@aws-0-region.pooler.supabase.co:6543/postgres
   ```

## 📋 步骤 3: 初始化数据库表结构

1. 点击左侧 **SQL Editor**
2. 点击 **New query**
3. 打开本地文件：`backend/supabase-init.sql`
4. 复制全部内容并粘贴到 SQL Editor
5. 点击 **Run** 执行
6. 确认所有表创建成功（应该看到成功提示）

## 📋 步骤 4: 生成 JWT_SECRET

在终端运行：
```bash
openssl rand -hex 32
```

复制输出的 64 位随机字符串（例如：`a1b2c3d4e5f6...`）

## 📋 步骤 5: 部署后端到 Vercel

### 方法 A：使用 Vercel CLI（推荐）

```bash
# 进入后端目录
cd /home/admin/openclaw/workspace/distribution-system/backend

# 登录 Vercel（如果还没登录）
vercel login

# 部署到生产环境
vercel --prod
```

### 方法 B：通过 GitHub 导入

1. 访问：https://vercel.com/new
2. 点击 "Import Git Repository"
3. 选择 `xtit/distribution-system` 仓库
4. **Root Directory** 设置为 `backend`
5. **Framework Preset** 选择 `Other`
6. 点击 "Deploy"

## 📋 步骤 6: 配置环境变量

### 如果使用 Vercel CLI：
```bash
cd backend
vercel env add DATABASE_URL production
# 粘贴 Supabase 连接字符串

vercel env add JWT_SECRET production
# 粘贴生成的 JWT_SECRET

vercel env add NODE_ENV production
# 输入：production

# 重新部署以应用环境变量
vercel --prod
```

### 如果在 Vercel Dashboard 配置：
1. 进入项目设置
2. 点击 **Environment Variables**
3. 添加以下变量：
   - `DATABASE_URL`: Supabase 连接字符串
   - `JWT_SECRET`: 生成的随机字符串
   - `NODE_ENV`: `production`
4. 重新部署项目

## 📋 步骤 7: 测试 API

部署完成后，Vercel 会给你一个域名，例如：
```
https://distribution-system-api.vercel.app
```

测试健康检查：
```bash
curl https://distribution-system-api.vercel.app/health
```

预期输出：
```json
{"status":"ok","timestamp":"2026-03-23T01:15:00.000Z"}
```

## 📋 步骤 8: 更新前端 API 地址

### 移动端前端

编辑 `mobile-frontend/.env.production`：
```bash
VITE_API_URL=https://distribution-system-api.vercel.app
```

### 管理后台

编辑 `admin-frontend/index.html`（第 218 行附近）：
```javascript
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:3010/api' 
  : 'https://distribution-system-api.vercel.app/api';
```

## 📋 步骤 9: 重新部署前端

```bash
# 提交更改
cd /home/admin/openclaw/workspace/distribution-system
git add -A
git commit -m "配置生产环境 API 地址"
git push

# Vercel 会自动重新部署
```

## 📋 步骤 10: 完整测试

### 1. 测试后端 API
```bash
# 健康检查
curl https://distribution-system-api.vercel.app/health

# 管理员登录
curl -X POST https://distribution-system-api.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 2. 测试移动端
1. 访问：https://distribution-system-psi.vercel.app
2. 注册新用户
3. 登录
4. 查看商品列表

### 3. 测试管理后台
1. 访问：https://distribution-system-admin.vercel.app
2. 自动登录（admin/admin123）
3. 查看数据统计
4. 管理商品

## ⚠️ 常见问题

### 1. 数据库连接失败
- 检查 `DATABASE_URL` 是否正确
- 确认使用了 Pooler 模式（端口 6543）
- 检查 Supabase 项目是否创建成功

### 2. API 返回 500 错误
- 查看 Vercel 部署日志
- 确认 `JWT_SECRET` 已配置
- 检查数据库表是否初始化

### 3. 前端无法连接 API
- 检查 CORS 配置
- 确认 API 地址正确
- 查看浏览器控制台错误

## 🔗 相关文档

- Supabase 文档：https://supabase.com/docs
- Vercel Serverless 文档：https://vercel.com/docs/functions
- 项目部署指南：`VERCEL_DEPLOYMENT.md`

---

**创建时间**: 2026-03-23
**预计耗时**: 10-15 分钟
