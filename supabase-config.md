# Supabase 配置信息

## 项目信息
- **Project ID**: kdpgnhpfkyugrlnpmtju
- **Project Name**: distribution-system
- **Organization**: xjy@xtit.net's Org
- **Region**: Northeast Asia (Tokyo) - ap-northeast-1

## 数据库连接字符串

### Transaction Pooler（推荐用于 Vercel Serverless）
```
postgresql://postgres.kdpgnhpfkyugrlnpmtju:[YOUR-PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
```

### Direct Connection
```
postgresql://postgres:[YOUR-PASSWORD]@db.kdpgnhpfkyugrlnpmtju.supabase.co:5432/postgres
```

## 环境变量配置

### Vercel 环境变量
```bash
# 数据库连接（使用 Pooler 模式）
DATABASE_URL=postgresql://postgres.kdpgnhpfkyugrlnpmtju:[YOUR-PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres

# JWT 密钥（需要生成）
JWT_SECRET=<运行 openssl rand -hex 32 生成>

# 环境
NODE_ENV=production
```

## 下一步操作

### 1. 生成 JWT_SECRET
在终端运行：
```bash
openssl rand -hex 32
```

### 2. 初始化数据库
1. 访问：https://supabase.com/dashboard/project/kdpgnhpfkyugrlnpmtju/sql
2. 点击 "New query"
3. 复制并运行 `backend/supabase-init.sql` 文件内容

### 3. 部署后端到 Vercel
```bash
cd /home/admin/openclaw/workspace/distribution-system/backend
vercel --prod
```

### 4. 配置 Vercel 环境变量
```bash
vercel env add DATABASE_URL production
# 粘贴上面的 DATABASE_URL（替换 [YOUR-PASSWORD] 为实际密码）

vercel env add JWT_SECRET production
# 粘贴生成的 JWT_SECRET

vercel env add NODE_ENV production
# 输入：production
```

### 5. 更新前端 API 地址
创建 `mobile-frontend/.env.production`：
```
VITE_API_URL=https://distribution-system-api.vercel.app
```

### 6. 重新部署前端
```bash
cd /home/admin/openclaw/workspace/distribution-system
git add -A
git commit -m "配置生产环境 API 地址"
git push
```

## 测试命令

### 测试后端 API
```bash
# 健康检查
curl https://distribution-system-api.vercel.app/health

# 管理员登录
curl -X POST https://distribution-system-api.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 重要链接

- **Dashboard**: https://supabase.com/dashboard/project/kdpgnhpfkyugrlnpmtju
- **SQL Editor**: https://supabase.com/dashboard/project/kdpgnhpfkyugrlnpmtju/sql
- **Table Editor**: https://supabase.com/dashboard/project/kdpgnhpfkyugrlnpmtju/editor
- **Database Settings**: https://supabase.com/dashboard/project/kdpgnhpfkyugrlnpmtju/database/settings

---
**创建时间**: 2026-03-23
**数据库密码**: JgdDwJ9iK2Df8hdu（已生成，请妥善保管）
