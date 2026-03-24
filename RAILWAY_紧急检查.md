# 🚨 Railway 部署紧急检查

## 问题：502 Application failed to respond

这通常意味着 Railway 部署了但应用没有正常启动。

## 🔍 请立即检查以下项目

### 1️⃣ Root Directory 配置（最常见原因）

访问：https://railway.app/project/你的项目

1. 点击你的服务（distribution-system）
2. 点击 **"Settings"** 标签
3. 找到 **"Root Directory"**
4. 确认值为：`backend`
5. 如果不是，请修改为 `backend` 并保存

> **为什么重要？**
> 如果 Root Directory 不是 `backend`，Railway 会在根目录找 `package.json`，找不到或启动失败。

---

### 2️⃣ 环境变量检查

在 **"Variables"** 标签页，确认以下变量存在且正确：

| 变量名 | 应该的值 |
|--------|---------|
| `DATABASE_URL` | `postgresql://postgres.kdpgnhpfkyugrlnpmtju:JgdDwJ9iK2Df8hdu@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres` |
| `JWT_SECRET` | `51fd80b0b242824b750c231983b512ff1dc38f046c1da06206f4a54b70d35233` |
| `NODE_ENV` | `production` |
| `PORT` | `3010` |

**特别注意**：
- 检查 `DATABASE_URL` 是否完整（没有截断）
- 检查 `PORT` 是否是 `3010`（Railway 默认使用 `$PORT` 环境变量）

---

### 3️⃣ 查看部署日志

在 **"Deployments"** 标签页：

1. 点击最新的部署（顶部的）
2. 查看实时日志
3. 找以下关键信息：

**成功启动的标志**：
```
✅ 服务器启动成功：http://0.0.0.0:3010
🌍 环境：production
📊 管理后台 API: http://0.0.0.0:3010/api/admin
```

**失败的可能原因**：
- `Error: Cannot find module` → Root Directory 错误
- `Database connection failed` → DATABASE_URL 错误
- `Port 3010 is already in use` → 端口冲突
- `Timeout` → 数据库连接超时

---

### 4️⃣ 检查域名配置

在 **"Settings"** → **"Networking"** 或 **"Domains"**：

1. 确认已生成域名（类似 `distribution-system-production.up.railway.app`）
2. 确认域名是 **Public**（公开的）
3. 如果是 Private，点击 **"Generate Domain"** 或 **"Make Public"**

---

## 📋 如果以上都正确

请复制部署日志中的错误信息发给我，我会进一步诊断。

**日志位置**：
Railway Dashboard → 你的项目 → Deployments → 点击最新部署 → 查看日志

---

## 🔧 快速修复步骤

如果发现问题：

1. **Root Directory 错误**：修改为 `backend`，保存后会自动重新部署
2. **环境变量缺失**：添加变量后会自动重新部署
3. **域名未生成**：点击 "Generate Domain"

重新部署后等待 2-3 分钟，然后测试：
```bash
curl https://distribution-system-production.up.railway.app/health
```

---

**更新时间**: 2026-03-24 12:58
