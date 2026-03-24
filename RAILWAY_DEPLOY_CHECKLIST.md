# 🚀 Railway 后端部署检查清单

## 前置准备 ✅

- [x] Railway CLI 已安装
- [x] 项目配置文件已创建 (`railway.json`, `nixpacks.toml`)
- [x] 后端代码支持 Railway 部署
- [x] Supabase 数据库已就绪

## 部署步骤

### 1️⃣ 访问 Railway 并登录

**URL**: https://railway.app/dashboard

点击 **"Login"** → 使用 GitHub 登录

---

### 2️⃣ 创建新项目

1. 点击 **"New"** 按钮（顶部导航栏）
2. 选择 **"Deploy from GitHub repo"**

---

### 3️⃣ 选择仓库

1. 在 GitHub 授权页面，允许 Railway 访问你的 GitHub 账号
2. 找到并点击 **`xtit/distribution-system`** 仓库
3. 点击 **"Deploy Now"**

---

### 4️⃣ 配置 Root Directory ⚠️（关键步骤）

部署开始后，立即执行：

1. 点击刚创建的服务卡片（显示 `distribution-system`）
2. 点击顶部 **"Settings"** 标签
3. 向下滚动找到 **"Root Directory"** 字段
4. 输入：`backend`
5. 点击 **"Save"** 按钮

> **为什么需要这一步？**
> 因为后端代码在 `backend/` 子目录中，不配置的话 Railway 会在根目录找 `package.json` 会失败。

---

### 5️⃣ 添加环境变量 ⚠️（关键步骤）

1. 点击 **"Variables"** 标签
2. 点击 **"New Variable"** 或 **"Add Variable"** 按钮
3. 依次添加以下 4 个变量：

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

---

### 6️⃣ 等待部署完成

1. 点击 **"Deployments"** 标签
2. 查看实时部署日志
3. 等待状态变为绿色 **"SUCCESS"**

**预计耗时**: 2-5 分钟

---

### 7️⃣ 获取公网 URL

部署成功后：

1. 点击 **"Settings"** 标签
2. 找到 **"Domains"** 或 **"Public Networking"** 部分
3. 点击 **"Generate Domain"** 或 **"Create Domain"**
4. 复制生成的 URL（类似：`https://distribution-system-production.up.railway.app`）

---

### 8️⃣ 测试 API

在终端测试：
```bash
# 健康检查（替换为你的 Railway URL）
curl https://你的 railway 地址/health

# 预期输出：
# {"status":"ok","timestamp":"2026-03-24T..."}
```

---

### 9️⃣ 更新前端配置

1. 编辑文件：`/home/admin/openclaw/workspace/distribution-system/mobile-frontend/.env.production`
2. 修改 `VITE_API_URL` 为 Railway 地址：
   ```
   VITE_API_URL=https://你的 railway 地址
   ```
3. 保存文件

---

### 🔟 重新部署前端

```bash
cd /home/admin/openclaw/workspace/distribution-system/mobile-frontend
git add .env.production
git commit -m "更新 API 地址为 Railway"
git push
```

Vercel 会自动重新部署前端。

---

## ✅ 完成检查

- [ ] Railway 后端部署成功（绿色状态）
- [ ] 健康检查接口返回正常
- [ ] 前端 API 地址已更新
- [ ] 前端重新部署完成
- [ ] 可以正常登录和使用

---

## 🆘 遇到问题？

### 部署失败
- 检查 Root Directory 是否设置为 `backend`
- 检查所有环境变量是否正确
- 查看部署日志中的错误信息

### API 无法访问
- 确认已生成公共域名（Domains）
- 确认部署状态为绿色 SUCCESS
- 检查防火墙/网络问题

### 数据库连接失败
- 确认 `DATABASE_URL` 变量正确
- 确认 Supabase 项目正常运行
- 检查数据库表是否已创建

---

**预计总耗时**: 10-15 分钟
**难度**: ⭐⭐☆☆☆（简单）
