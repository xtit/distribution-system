# 📸 README 截图占位符说明

当前 README 中已添加截图占位符，您需要添加实际截图文件。

---

## 📁 需要添加的截图文件

请在 `docs/screenshots/` 目录下添加以下文件：

### 移动端截图（10 张）

1. `mobile-login.png` - 登录页面
2. `mobile-register.png` - 注册页面
3. `mobile-home.png` - 首页商品列表
4. `mobile-product-detail.png` - 商品详情页
5. `mobile-order-list.png` - 订单列表
6. `mobile-order-detail.png` - 订单详情
7. `mobile-profile.png` - 个人中心
8. `mobile-invite-poster.png` - 邀请海报（二维码）
9. `mobile-referees.png` - 下级列表
10. `mobile-commissions.png` - 佣金记录

### 管理后台截图（7 张）

1. `admin-login.png` - 管理后台登录
2. `admin-dashboard.png` - 数据统计看板
3. `admin-users.png` - 用户管理
4. `admin-products.png` - 商品管理
5. `admin-orders.png` - 订单管理
6. `admin-commissions.png` - 佣金管理
7. `admin-settings.png` - 系统配置（修改密码）

---

## 📷 如何添加截图

### 快速方法（推荐）

1. **访问系统并截图**:
   - 移动端：https://distribution-system-psi.vercel.app
   - 管理后台：https://distribution-system-admin.vercel.app

2. **保存截图到对应目录**:
   ```bash
   mkdir -p docs/screenshots
   # 将截图文件保存到 docs/screenshots/
   ```

3. **提交到 Git**:
   ```bash
   git add docs/screenshots/*.png
   git commit -m "添加系统截图"
   git push
   ```

### 使用浏览器开发者工具

1. 打开 Chrome/Edge 浏览器
2. 访问对应页面
3. 按 `F12` 打开开发者工具
4. 按 `Ctrl+Shift+P` (Windows) 或 `Cmd+Shift+P` (Mac)
5. 输入 `screenshot`
6. 选择 `Capture full size screenshot`（完整页面截图）
7. 保存并重命名

---

## 🎨 截图建议

### 移动端
- **尺寸**: 375x667px (iPhone 尺寸) 或类似比例
- **格式**: PNG
- **内容**: 显示完整页面，包含底部导航栏

### 管理后台
- **尺寸**: 1440x900px 或 1920x1080px
- **格式**: PNG
- **内容**: 显示完整功能区域

---

## 📊 当前状态

- ✅ README 已更新，包含截图占位符
- ✅ 截图目录结构已创建
- ⏳ 等待添加实际截图文件

---

## 🔍 验证截图

添加截图后，访问 GitHub 仓库页面查看 README 是否正确显示：

https://github.com/xtit/distribution-system

如果图片无法显示，请检查：
1. 文件路径是否正确
2. 文件名是否匹配
3. 图片格式是否支持（PNG/JPG）
4. Git 是否正确提交

---

**创建时间**: 2026-03-24 17:50 GMT+8
