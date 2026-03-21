# 🚀 Vercel + Supabase 部署完整指南

**完全免费 | 国内可访问 | 自动 HTTPS | 15 分钟上线**

---

## 📋 部署架构

```
┌─────────────────┐
│   用户访问      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Vercel        │ ← 前端 + 后端（Serverless）
│  (全球 CDN)     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Supabase      │ ← PostgreSQL 数据库
│  (免费 500MB)   │
└─────────────────┘
```

---

## 第一步：创建 Supabase 数据库（5 分钟）

### 1. 注册 Supabase

**网址**: https://supabase.com

1. 访问官网
2. 点击 "Start your project"
3. 使用 GitHub 登录（推荐）或邮箱注册

### 2. 创建新项目

1. 点击 "New project"
2. 填写项目信息：
   ```
   Name: distribution-system
   Database Password: 设置一个强密码（记住它！）
   Region: Tokyo (日本，离中国最近)
   ```
3. 点击 "Create new project"
4. 等待 2-3 分钟初始化

### 3. 获取数据库连接字符串

1. 进入项目控制台
2. 点击左侧 "Settings" → "Database"
3. 找到 "Connection string"
4. 选择 "URI" 标签
5. 复制连接字符串，格式类似：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@xxx.xxx.supabase.co:5432/postgres
   ```

**重要**: 将 `[YOUR-PASSWORD]` 替换为你设置的密码

### 4. 初始化数据库表

1. 点击左侧 "SQL Editor"
2. 点击 "New query"
3. 复制并粘贴 `backend/supabase-init.sql` 的内容
4. 点击 "Run" 执行

**验证**: 左侧 Tables 应该出现 6 张表

---

## 第二步：部署到 Vercel（5 分钟）

### 方式一：通过 GitHub（推荐）

#### 1. 创建 GitHub 仓库

```bash
cd /home/admin/openclaw/workspace/distribution-system

# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 创建 GitHub 仓库（在 GitHub 网站上）
# 然后关联远程仓库
git remote add origin https://github.com/你的用户名/distribution-system.git

# 推送
git push -u origin main
```

#### 2. 部署到 Vercel

1. **访问**: https://vercel.com/new
2. **登录**: 使用 GitHub 登录
3. **导入项目**:
   - 点击 "Import Git Repository"
   - 选择你的 `distribution-system` 仓库
4. **配置项目**:
   ```
   Framework Preset: Vite
   Root Directory: mobile-frontend
   Build Command: npm run build
   Output Directory: dist
   ```
5. **添加环境变量**:
   点击 "Environment Variables"，添加：
   ```
   VITE_API_BASE = https://distribution-system-xxx.vercel.app/api
   DATABASE_URL = postgresql://postgres:密码@xxx.xxx.supabase.co:5432/postgres
   ```
6. **点击 "Deploy"**
7. 等待 2-3 分钟

### 方式二：使用 Vercel CLI（快速）

#### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

#### 3. 部署后端

```bash
cd backend

# 首次部署
vercel

# 按提示操作:
# - Set up and deploy? Y
# - Which scope? 选择你的账号
# - Link to existing project? N
# - Project name? distribution-backend
# - Directory? ./
# - Override settings? N

# 添加环境变量
vercel env add DATABASE_URL production

# 生产环境部署
vercel --prod
```

#### 4. 部署前端

```bash
cd mobile-frontend

# 构建
npm run build

# 部署
vercel --prod
```

---

## 第三步：配置环境变量（2 分钟）

### 在 Vercel 控制台添加

1. 访问：https://vercel.com/dashboard
2. 进入你的项目
3. Settings → Environment Variables
4. 添加以下变量：

**后端环境变量**:
```
DATABASE_URL = postgresql://postgres:[密码]@xxx.xxx.supabase.co:5432/postgres
NODE_ENV = production
PORT = 3010
JWT_SECRET = your-secret-key-change-this
```

**前端环境变量**:
```
VITE_API_BASE = https://你的项目.vercel.app/api
```

5. 点击 "Redeploy" 重新部署

---

## 第四步：测试验证（3 分钟）

### 1. 测试后端 API

```bash
# 健康检查
curl https://你的项目.vercel.app/health

# 应该返回:
# {"status":"ok","timestamp":"..."}
```

### 2. 测试前端

访问 Vercel 提供的地址：
```
https://你的项目.vercel.app
```

### 3. 测试登录

- 账号：`admin`
- 密码：`admin123`

### 4. 测试功能

- [ ] 商品列表显示
- [ ] 商品详情
- [ ] 个人中心
- [ ] 头像上传
- [ ] 订单创建

---

## ⚠️ 重要配置说明

### 1. 数据库连接

**本地开发** (`DATABASE_URL` 未设置):
```
使用 SQLite 文件：data/distribution.db
```

**Vercel 生产环境** (`DATABASE_URL` 已设置):
```
使用 Supabase PostgreSQL
```

### 2. 文件上传

Vercel Serverless 环境下，文件上传需要特殊处理：

**方案 A**: 使用云存储（推荐）
- 阿里云 OSS
- 腾讯云 COS
- Cloudinary（免费 25GB）

**方案 B**: 临时存储
- 文件保存在 `/tmp/` 目录
- 重启后文件丢失
- 仅用于测试

### 3. 冷启动

Vercel Serverless 有冷启动问题：
- 第一次访问：2-3 秒
- 后续访问：<100ms
- 解决：使用 Vercel Pro（$20/月）或保持活跃

---

## 🔧 常见问题

### Q1: 数据库连接失败？

**检查**:
```bash
# 验证 DATABASE_URL 格式
postgresql://postgres:密码@xxx.xxx.supabase.co:5432/postgres

# 确保密码正确
# 确保 Region 选择正确
```

**解决**:
1. 在 Supabase 控制台重置密码
2. 更新 Vercel 环境变量
3. 重新部署

### Q2: 部署失败？

**查看日志**:
```bash
vercel logs
```

**常见错误**:
- 构建超时：优化构建配置
- 依赖缺失：检查 package.json
- 端口冲突：使用 process.env.PORT

### Q3: 图片上传失败？

**原因**: Vercel Serverless 不支持持久化文件存储

**解决**:
1. 使用云存储（推荐 Cloudinary）
2. 或临时使用 `/tmp/` 目录（重启后丢失）

---

## 📊 性能优化

### 1. 数据库连接池

已在 `database.js` 中配置：
```javascript
pool: {
  max: 5,
  min: 0,
  acquire: 30000,
  idle: 10000
}
```

### 2. 静态资源 CDN

Vercel 自动使用全球 CDN：
- 前端静态文件：自动缓存
- 图片资源：建议用 CDN

### 3. API 响应优化

```javascript
// 添加缓存头
res.setHeader('Cache-Control', 'public, max-age=60');
```

---

## 🎯 获得的结果

部署完成后你将获得：

### 前端地址
```
https://distribution-system-xxx.vercel.app
```

### 后端 API
```
https://distribution-system-xxx.vercel.app/api
```

### 数据库
```
Supabase PostgreSQL (500MB 免费)
```

### 管理后台
```
https://distribution-system-xxx.vercel.app/admin-frontend/
```

---

## 💰 费用说明

| 项目 | 免费额度 | 是否收费 |
|------|----------|----------|
| Vercel | 100GB/月流量 | ✅ 免费 |
| Supabase | 500MB 数据库 | ✅ 免费 |
| 域名 | vercel.app 二级域名 | ✅ 免费 |
| HTTPS | 自动证书 | ✅ 免费 |
| **总计** | - | **¥0/月** |

---

## 🚀 下一步

### 1. 自定义域名（可选）

1. 购买域名（阿里云 ¥55/年）
2. Vercel Settings → Domains
3. 添加你的域名
4. 配置 DNS

### 2. 配置云存储（推荐）

**使用 Cloudinary（免费 25GB）**:

```bash
# 安装 SDK
npm install cloudinary

# 配置
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

### 3. 设置监控

- Vercel Analytics（内置）
- Supabase Logs（内置）
- Uptime Robot（免费监控）

---

## 📞 需要帮助？

如果遇到问题：

1. **查看 Vercel 日志**
   ```bash
   vercel logs
   ```

2. **检查 Supabase 连接**
   ```bash
   vercel env ls
   ```

3. **重新部署**
   ```bash
   vercel --prod
   ```

---

**祝你部署成功！🎉**

部署完成后，把链接分享给你的朋友们吧！
