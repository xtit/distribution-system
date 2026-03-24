# Railway 后端部署 - 快速指南

## 🎯 目标

将分销系统后端部署到 Railway，替代 Vercel。

## ✅ 已完成准备

1. ✅ Railway CLI 已安装
2. ✅ 项目配置文件已创建 (`railway.json`, `nixpacks.toml`)
3. ✅ 后端代码已优化支持 Railway

## 📋 部署步骤（5 分钟）

### 步骤 1：访问 Railway Dashboard

打开：https://railway.app/dashboard

### 步骤 2：创建新项目

1. 点击 **"New Project"** 按钮
2. 选择 **"Deploy from GitHub repo"**
3. 授权 Railway 访问 GitHub（如果首次使用）

### 步骤 3：选择仓库

1. 找到 `xtit/distribution-system` 仓库
2. 点击 **"Deploy Now"**

### 步骤 4：配置 Root Directory（重要！）

部署开始后：
1. 点击刚创建的服务卡片
2. 进入 **"Settings"** 标签
3. 找到 **"Root Directory"**
4. 输入：`backend`
5. 点击 **"Save"**

### 步骤 5：添加环境变量

在 **"Variables"** 标签页添加以下变量：

| 变量名 | 值 |
|--------|-----|
| `DATABASE_URL` | `postgresql://postgres.kdpgnhpfkyugrlnpmtju:JgdDwJ9iK2Df8hdu@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres` |
| `JWT_SECRET` | `51fd80b0b242824b750c231983b512ff1dc38f046c1da06206f4a54b70d35233` |
| `NODE_ENV` | `production` |
| `PORT` | `3010` |

### 步骤 6：等待部署完成

- Railway 会自动开始部署
- 查看 **"Deployments"** 标签页的日志
- 部署成功后会生成一个公网 URL（类似：`https://xxx-production.up.railway.app`）

### 步骤 7：测试 API

部署完成后测试：
```bash
# 健康检查
curl https://你的 railway 地址/health

# 预期输出：{"status":"ok","timestamp":"..."}
```

### 步骤 8：更新前端配置

更新移动端前端 API 地址：
```bash
# 编辑文件
cd /home/admin/openclaw/workspace/distribution-system/mobile-frontend

# 修改 .env.production
VITE_API_URL=https://你的 railway 地址
```

然后重新部署前端到 Vercel。

---

## 🔧 故障排查

### 部署失败
- 检查 Root Directory 是否设置为 `backend`
- 检查环境变量是否正确
- 查看部署日志找错误信息

### API 无法访问
- 确认部署成功（绿色状态）
- 检查 Railway 项目是否公开（或生成公共 URL）
- 测试健康检查端点 `/health`

---

## 📊 项目信息

- **GitHub 仓库**: https://github.com/xtit/distribution-system
- **后端目录**: `backend/`
- **入口文件**: `backend/src/index.js`
- **启动命令**: `npm start`

---

**创建时间**: 2026-03-24
**预计耗时**: 5-10 分钟
