# 🚀 分销系统部署完整指南

**部署目标**: 将系统部署到互联网，让朋友们可以访问  
**推荐方案**: Vercel (前端) + Vercel Serverless (后端)  
**成本**: ¥0/月 (完全免费)  
**时间**: 约 15-20 分钟

---

## 📋 部署前准备

### 1. 注册账号

**Vercel**: https://vercel.com/signup
- 使用 GitHub 账号登录（推荐）
- 或邮箱注册

**GitHub**: https://github.com/signup
- 如果没有 GitHub 账号，先注册

### 2. 本地代码准备

代码已经在 Git 仓库中，检查状态：

```bash
cd /home/admin/openclaw/workspace/distribution-system
git status
```

应该显示干净的仓库。

---

## 🎯 部署步骤

### 第一步：创建 GitHub 仓库（3 分钟）

1. **访问 GitHub**: https://github.com/new

2. **创建仓库**:
   ```
   Repository name: distribution-system
   Description: 分销系统 - 商品管理 + 移动端
   Public: ✅ (公开仓库，Vercel 才能访问)
   Initialize with README: ❌ (不要勾选)
   ```

3. **点击 "Create repository"**

4. **推送代码**:
   ```bash
   cd /home/admin/openclaw/workspace/distribution-system
   
   # 关联远程仓库（替换为你的 GitHub 用户名）
   git remote add origin https://github.com/你的用户名/distribution-system.git
   
   # 推送代码
   git branch -M main
   git push -u origin main
   ```

5. **验证**: 刷新 GitHub 仓库页面，应该能看到代码

---

### 第二步：部署到 Vercel（5 分钟）

#### 方式 A：通过 Vercel 官网（推荐）

1. **访问 Vercel**: https://vercel.com/new

2. **导入 Git 仓库**:
   - 点击 "Import Git Repository"
   - 选择 "Import GitHub App"
   - 授权 Vercel 访问你的 GitHub
   - 选择 `distribution-system` 仓库

3. **配置项目**:
   
   **Root Directory**: 保持默认（根目录）
   
   **Framework Preset**: Vite
   
   **Build Command**: 
   ```
   cd mobile-frontend && npm install && npm run build
   ```
   
   **Output Directory**: 
   ```
   mobile-frontend/dist
   ```

4. **添加环境变量**:
   点击 "Environment Variables"，添加：
   ```
   VITE_API_BASE = https://你的项目名.vercel.app/api
   NODE_ENV = production
   ```

5. **点击 "Deploy"**

6. **等待部署**（约 2-3 分钟）

7. **获得访问地址**:
   ```
   https://distribution-system-xxx.vercel.app
   ```

#### 方式 B：使用 Vercel CLI（快速）

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
cd /home/admin/openclaw/workspace/distribution-system
vercel

# 按提示操作:
# - Set up and deploy? Y
# - Which scope? 选择你的账号
# - Link to existing project? N
# - Project name? distribution-system
# - Directory? ./
# - Override settings? N

# 生产部署
vercel --prod
```

---

### 第三步：配置后端 API（5 分钟）

由于 Vercel Serverless 的限制，需要配置后端：

#### 1. 创建 `vercel.json`（已创建）

文件已在 `backend/vercel.json`，内容：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/src/index.js"
    }
  ]
}
```

#### 2. 配置数据库

**方案 A: 使用 SQLite（简单，适合测试）**
- 已配置自动使用 SQLite
- 数据保存在 `/tmp/database.db`
- ⚠️ 注意：Vercel Serverless 重启后数据会丢失

**方案 B: 使用 Supabase PostgreSQL（推荐，数据持久化）**

1. 访问：https://supabase.com/new
2. 创建项目：
   ```
   Name: distribution-system
   Database Password: 设置强密码
   Region: Tokyo (日本，离中国近)
   ```
3. 获取连接字符串：Settings → Database → Connection string
4. 在 Vercel 添加环境变量：
   ```
   DATABASE_URL = postgresql://postgres:[密码]@xxx.supabase.co:5432/postgres
   ```

#### 3. 更新前端 API 地址

在 Vercel 项目设置中，更新环境变量：
```
VITE_API_BASE = https://你的项目名.vercel.app/api
```

重新部署：
```bash
vercel --prod
```

---

### 第四步：测试访问（2 分钟）

#### 1. 访问前端

打开浏览器访问：
```
https://你的项目名.vercel.app
```

#### 2. 测试功能

- [ ] 页面加载正常
- [ ] 商品列表显示
- [ ] 商品详情显示
- [ ] 登录功能（admin/admin123）
- [ ] 个人中心

#### 3. 测试 API

访问：
```
https://你的项目名.vercel.app/api/health
```

应该返回：
```json
{"status":"ok","timestamp":"..."}
```

---

## ⚠️ 重要注意事项

### 1. 数据持久化

**SQLite 问题**:
- Vercel Serverless 使用临时文件系统
- 重启后数据会丢失
- 适合测试，不适合生产

**解决方案**:
- 使用 Supabase PostgreSQL（免费 500MB）
- 或使用其他云数据库

### 2. 文件上传

**问题**:
- Vercel Serverless 不支持持久化文件存储
- 上传的图片会丢失

**解决方案**:
- 使用云存储：阿里云 OSS、腾讯云 COS、Cloudinary
- 或暂时使用本地存储（测试用）

### 3. 冷启动

**问题**:
- Serverless 函数首次访问需要 2-3 秒启动
- 后续访问很快（<100ms）

**解决方案**:
- 使用 Vercel Pro（$20/月）
- 或使用其他支持长连接的平台

### 4. 国内访问速度

**Vercel**:
- 全球 CDN，国内访问速度尚可
- 约 200-500ms

**优化**:
- 使用 Cloudflare CDN
- 或选择国内云平台

---

## 🔧 故障排查

### 问题 1: 404 Not Found

**原因**: 路由配置错误

**解决**:
1. 检查 `vercel.json` 配置
2. 查看 Vercel 部署日志
3. 确认 API 路径正确

### 问题 2: 数据库连接失败

**原因**: DATABASE_URL 配置错误

**解决**:
1. 检查环境变量是否正确
2. 确认 Supabase 项目已创建
3. 检查防火墙设置

### 问题 3: 页面空白

**原因**: 前端构建失败

**解决**:
1. 查看 Vercel 构建日志
2. 检查 `vite.config.js` 配置
3. 确认 `VITE_API_BASE` 环境变量

### 问题 4: 图片不显示

**原因**: 图片路径错误或 CORS 问题

**解决**:
1. 检查图片 URL 是否正确
2. 配置 CORS 允许跨域
3. 使用 CDN 托管图片

---

## 📊 部署完成后的地址

### 前端地址
```
https://distribution-system-xxx.vercel.app
```

### 后端 API
```
https://distribution-system-xxx.vercel.app/api
```

### 健康检查
```
https://distribution-system-xxx.vercel.app/api/health
```

### 管理后台
```
https://distribution-system-xxx.vercel.app/admin-frontend/
```

---

## 🎯 分享给朋友们

部署完成后，将前端地址分享给朋友们：

```
🎉 我的分销系统上线啦！

访问地址：https://distribution-system-xxx.vercel.app

测试账号：
- 管理员：admin / admin123
- 普通用户：testuser / test123

快来体验吧！
```

---

## 📝 后续优化

### 1. 自定义域名

1. 购买域名（阿里云 ¥55/年）
2. Vercel Settings → Domains
3. 添加你的域名
4. 配置 DNS

### 2. 数据库优化

- 使用 Supabase PostgreSQL
- 配置数据库连接池
- 添加索引优化查询

### 3. 图片优化

- 使用 Cloudinary 免费 25GB
- 自动生成缩略图
- 使用 WebP 格式

### 4. 性能优化

- 启用 Gzip 压缩
- 配置 CDN 缓存
- 优化数据库查询

---

## 💰 费用说明

| 项目 | 免费额度 | 是否收费 |
|------|----------|----------|
| Vercel | 100GB/月流量 | ✅ 免费 |
| Supabase | 500MB 数据库 | ✅ 免费 |
| 域名（可选） | - | ¥55/年 |
| **总计** | - | **¥0/月** |

---

## 📞 需要帮助？

### Vercel 文档
- https://vercel.com/docs

### Supabase 文档
- https://supabase.com/docs

### 项目问题
- 查看 Vercel 部署日志
- 检查浏览器控制台错误
- 查看后端日志

---

**祝你部署成功！🎉**
