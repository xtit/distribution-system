# ⚡ Railway 快速部署（5 分钟）

## 你已经登录了 Railway，现在只需 5 步：

### 1️⃣ 创建项目
- 访问：https://railway.app/dashboard
- 点击 **"New"** → **"Deploy from GitHub repo"**
- 选择 `xtit/distribution-system` 仓库

### 2️⃣ 配置 Root Directory
- 在 Railway Dashboard 点击刚创建的服务
- 点击 **"Settings"** 标签
- **Root Directory**: 输入 `backend`
- 点击 **Save**

### 3️⃣ 添加环境变量
点击 **"Variables"** 标签，添加以下 4 个变量：

```
DATABASE_URL = postgresql://postgres.kdpgnhpfkyugrlnpmtju:JgdDwJ9iK2Df8hdu@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
JWT_SECRET = 51fd80b0b242824b750c231983b512ff1dc38f046c1da06206f4a54b70d35233
NODE_ENV = production
PORT = 3010
```

### 4️⃣ 等待部署
- Railway 会自动重新部署（2-3 分钟）
- 在 **"Deployments"** 标签查看状态
- 等待显示 **"Running"**

### 5️⃣ 获取 URL 并告诉我
- 点击 **"Settings"** → 找到 **"Domains"**
- 复制 URL（格式：`https://xxx.up.railway.app`）
- **把 URL 发给我**，我帮你更新前端配置

---

## 🎯 完成后测试

访问：`https://your-railway-url.up.railway.app/health`

应该看到：`{"status":"ok",...}`

---

**详细步骤**: 请查看 `RAILWAY_COMPLETE_GUIDE.md`
