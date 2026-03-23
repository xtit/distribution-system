# ✅ Railway 部署操作清单

## 请按顺序点击以下链接完成操作：

### 步骤 1: 创建新项目
🔗 点击：https://railway.app/new?workspaceId=5695b3b9-7af4-4620-8897-1e2c6112fe08

- 选择 **"Deploy from GitHub repo"**
- 找到并点击 **`xtit/distribution-system`**
- 点击 **"Deploy Now"**

### 步骤 2: 配置服务
部署开始后，点击服务卡片进入详情页

- 点击 **"Settings"** 标签页
- 找到 **"Root Directory"** 字段
- 输入：`backend`
- 点击 **"Save"**

### 步骤 3: 添加环境变量
点击 **"Variables"** 标签页，然后点击 **"New Variable"**

依次添加以下 4 个变量（每个变量点击一次 "New Variable"）：

#### 变量 1
```
Name: DATABASE_URL
Value: postgresql://postgres.kdpgnhpfkyugrlnpmtju:JgdDwJ9iK2Df8hdu@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
```

#### 变量 2
```
Name: JWT_SECRET
Value: 51fd80b0b242824b750c231983b512ff1dc38f046c1da06206f4a54b70d35233
```

#### 变量 3
```
Name: NODE_ENV
Value: production
```

#### 变量 4
```
Name: PORT
Value: 3010
```

### 步骤 4: 等待部署
- Railway 会自动重新部署（约 2-3 分钟）
- 点击 **"Deployments"** 标签页查看进度
- 等待状态变为 **"Running"**（绿色）

### 步骤 5: 获取 URL
部署成功后：

- 点击 **"Settings"** 标签页
- 滚动到 **"Domains"** 或 **"Public Networking"** 部分
- 复制显示的 URL（格式：`https://xxx-production.up.railway.app`）

### 步骤 6: 测试
在浏览器中打开：`https://your-railway-url.up.railway.app/health`

应该看到：
```json
{
  "status": "ok",
  "timestamp": "2026-03-23T..."
}
```

### 步骤 7: 告诉我 URL
**把 Railway URL 发给我**，我会：
1. 更新前端配置
2. 重新部署前端
3. 完成最后的测试

---

## 📋 快速链接

- Railway Dashboard: https://railway.app/dashboard
- 新建项目：https://railway.app/new
- 文档：https://docs.railway.com

---

**预计时间**: 5-10 分钟
**难度**: ⭐⭐☆☆☆
