# 分销系统 Vercel 全栈部署指南

## ✅ 已完成

### 前端部署
- **移动端**: https://distribution-system-psi.vercel.app
- **管理后台**: https://distribution-system-admin.vercel.app
- **状态**: ✅ 已部署，Vite 框架配置正确

## 📋 后端部署方案

### 方案选择

由于 Vercel Serverless 的限制（无状态、冷启动、SQLite 不支持），我们采用以下方案：

#### 推荐方案：Vercel + Supabase（已配置）

**优势**:
- ✅ 后端代码已经支持 Supabase (PostgreSQL)
- ✅ 数据库已有初始化脚本 (`backend/supabase-init.sql`)
- ✅ Vercel Serverless 免费额度够用
- ✅ 全球 CDN 加速

**架构**:
```
移动端 (Vercel) ─┐
                ├─→ API 后端 (Vercel Serverless) ─→ Supabase (PostgreSQL)
管理后台 (Vercel) ─┘
```

## 🚀 部署步骤

### 1. 创建 Supabase 数据库

1. 访问 https://supabase.com
2. 创建新项目（免费套餐）
3. 等待数据库创建完成
4. 进入 **Settings** → **Database**
5. 复制 **Connection String** (Pooler 模式)
   - 格式：`postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres`

### 2. 初始化数据库

1. 进入 Supabase **SQL Editor**
2. 运行 `backend/supabase-init.sql` 文件内容
3. 确认所有表创建成功

### 3. 部署后端到 Vercel

#### 方法 A：使用 Vercel CLI（推荐）

```bash
cd /home/admin/openclaw/workspace/distribution-system/backend

# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 部署
vercel --prod
```

#### 方法 B：通过 GitHub 导入

1. 访问 https://vercel.com/new
2. 导入 `xtit/distribution-system` 仓库
3. **Root Directory** 设置为 `backend`
4. **Framework Preset** 选择 `Other`
5. 添加环境变量（见下方）
6. 点击 Deploy

### 4. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

```bash
# 数据库（必填）
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres

# JWT 密钥（必填）
JWT_SECRET=your-random-secret-key-here

# 生产环境
NODE_ENV=production

# 可选：文件上传配置
UPLOAD_DIR=/tmp/uploads
```

**生成 JWT_SECRET**:
```bash
openssl rand -hex 32
```

### 5. 更新前端 API 地址

#### 移动端前端

编辑 `mobile-frontend/src/api/request.js`:

```javascript
const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://distribution-system-api.vercel.app',
  timeout: 10000
})
```

创建 `mobile-frontend/.env.production`:
```
VITE_API_URL=https://distribution-system-api.vercel.app
```

#### 管理后台

编辑 `admin-frontend/src/api/request.js` (如果存在):

```javascript
const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://distribution-system-api.vercel.app',
  timeout: 10000
})
```

创建 `admin-frontend/.env.production`:
```
VITE_API_URL=https://distribution-system-api.vercel.app
```

### 6. 重新部署前端

```bash
# 移动端
cd mobile-frontend
git add .
git commit -m "配置生产环境 API 地址"
git push

# 管理后台
cd ../admin-frontend
git add .
git commit -m "配置生产环境 API 地址"
git push
```

## 🧪 测试联调

### 1. 测试后端 API

```bash
# 健康检查
curl https://distribution-system-api.vercel.app/health

# 预期输出: {"status":"ok","timestamp":"..."}
```

### 2. 测试用户注册

```bash
curl -X POST https://distribution-system-api.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "password": "123456",
    "phone": "13800138000"
  }'
```

### 3. 访问移动端

1. 打开 https://distribution-system-psi.vercel.app
2. 注册新账号
3. 登录
4. 查看商品列表

### 4. 访问管理后台

1. 打开 https://distribution-system-admin.vercel.app
2. 使用管理员账号登录
3. 查看数据统计

## ⚠️ 注意事项

### Vercel Serverless 限制

1. **冷启动**: 首次访问可能有 1-3 秒延迟
   - 解决：使用 Vercel Pro 或保持定期访问

2. **执行时间**: 最大 10 秒（Hobby 套餐）
   - 优化：数据库查询加索引，避免复杂操作

3. **文件大小**: 上传文件最大 4.5MB
   - 解决：使用 Supabase Storage 或第三方服务

4. **无状态**: 不能保存文件到本地
   - 解决：使用 `/tmp` 目录（临时）或云存储

### 数据库优化

1. **连接池**: Supabase 已配置连接池，避免过多连接
2. **索引**: 为常用查询字段添加索引
3. **SSL**: 生产环境强制 SSL 连接（已配置）

## 🔧 故障排查

### 后端部署失败

```bash
# 查看构建日志
vercel logs --follow

# 本地测试 Vercel 环境
vercel dev
```

### API 返回 500 错误

1. 检查 Vercel 函数日志
2. 确认 `DATABASE_URL` 环境变量正确
3. 验证 Supabase 数据库连接

### 前端无法连接 API

1. 检查浏览器控制台 CORS 错误
2. 确认 API 地址正确
3. 检查后端 CORS 配置

## 📊 项目地址汇总

| 项目 | 地址 | 状态 |
|------|------|------|
| GitHub 仓库 | https://github.com/xtit/distribution-system | ✅ |
| 移动端前端 | https://distribution-system-psi.vercel.app | ✅ |
| 管理后台 | https://distribution-system-admin.vercel.app | ✅ |
| 后端 API | 待部署 | ⏳ |
| Supabase 数据库 | 待创建 | ⏳ |

## 🎯 下一步

1. ✅ 创建 Supabase 项目
2. ✅ 部署后端 API 到 Vercel
3. ✅ 配置环境变量
4. ✅ 更新前端 API 地址
5. ✅ 测试联调

---

**创建时间**: 2026-03-23  
**最后更新**: 2026-03-23
