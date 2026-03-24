# 📸 Imgur 截图上传指南

Imgur 是一个免费的图片托管服务，无需注册即可使用。

---

## 🔗 快速上传链接

**直接上传**: https://imgur.com/upload

---

## 📷 上传步骤

### 步骤 1: 截取系统图片

#### 移动端截图（10 张）

访问：https://distribution-system-psi.vercel.app

1. **登录页面**
   - 打开首页（会自动跳转到登录）
   - 截图保存为 `mobile-login.png`

2. **注册页面**
   - 点击"去注册"
   - 截图保存为 `mobile-register.png`

3. **首页商品列表**
   - 登录后访问首页
   - 显示至少 3 个商品
   - 截图保存为 `mobile-home.png`

4. **商品详情页**
   - 点击任意商品
   - 截图保存为 `mobile-product-detail.png`

5. **订单列表**
   - 点击底部导航"订单"
   - 截图保存为 `mobile-order-list.png`

6. **订单详情**
   - 点击任意订单
   - 截图保存为 `mobile-order-detail.png`

7. **个人中心**
   - 点击底部导航"我的"
   - 截图保存为 `mobile-profile.png`

8. **邀请海报**
   - 在个人中心点击"分享二维码"
   - 截图保存为 `mobile-invite-poster.png`

9. **下级列表**
   - 在个人中心点击"下级列表"
   - 截图保存为 `mobile-referees.png`

10. **佣金记录**
    - 在个人中心点击"佣金记录"
    - 截图保存为 `mobile-commissions.png`

#### 管理后台截图（7 张）

访问：https://distribution-system-admin.vercel.app

登录账号：admin / admin123

1. **登录页面**
   - 打开登录页（显示验证码）
   - 截图保存为 `admin-login.png`

2. **数据统计**
   - 登录后默认显示数据统计
   - 显示 4 个统计卡片
   - 截图保存为 `admin-dashboard.png`

3. **用户管理**
   - 点击"用户管理"标签
   - 显示用户列表和操作按钮
   - 截图保存为 `admin-users.png`

4. **商品管理**
   - 点击"商品管理"标签
   - 显示商品列表和操作按钮
   - 截图保存为 `admin-products.png`

5. **订单管理**
   - 点击"订单管理"标签
   - 显示订单列表
   - 截图保存为 `admin-orders.png`

6. **佣金管理**
   - 点击"佣金管理"标签
   - 显示佣金列表
   - 截图保存为 `admin-commissions.png`

7. **系统配置**
   - 点击"系统配置"标签
   - 显示修改密码表单
   - 截图保存为 `admin-settings.png`

---

### 步骤 2: 上传到 Imgur

1. **访问上传页面**: https://imgur.com/upload

2. **上传图片**:
   - 拖拽图片到上传区域
   - 或点击"Upload"按钮选择图片
   - 可以一次上传多张

3. **获取直接链接**:
   - 上传完成后，点击图片
   - 右键点击图片 → "复制图片地址"
   - 或点击"..." → "Get share links" → 复制"Direct Link"
   
   **链接格式**: `https://i.imgur.com/XXXXXXX.png`

---

### 步骤 3: 整理链接

创建一个文本文件，记录每张图片的链接：

```
移动端截图：
mobile-login.png: https://i.imgur.com/ABC123.png
mobile-register.png: https://i.imgur.com/DEF456.png
mobile-home.png: https://i.imgur.com/GHI789.png
mobile-product-detail.png: https://i.imgur.com/JKL012.png
mobile-order-list.png: https://i.imgur.com/MNO345.png
mobile-order-detail.png: https://i.imgur.com/PQR678.png
mobile-profile.png: https://i.imgur.com/STU901.png
mobile-invite-poster.png: https://i.imgur.com/VWX234.png
mobile-referees.png: https://i.imgur.com/YZA567.png
mobile-commissions.png: https://i.imgur.com/BCD890.png

管理后台截图：
admin-login.png: https://i.imgur.com/EFG123.png
admin-dashboard.png: https://i.imgur.com/HIJ456.png
admin-users.png: https://i.imgur.com/KLM789.png
admin-products.png: https://i.imgur.com/NOP012.png
admin-orders.png: https://i.imgur.com/QRS345.png
admin-commissions.png: https://i.imgur.com/TUV678.png
admin-settings.png: https://i.imgur.com/WXY901.png
```

---

### 步骤 4: 发送链接

将整理好的链接列表发送给我，我会立即更新 README。

---

## 💡 截图技巧

### 浏览器开发者工具（推荐）

1. 按 `F12` 打开开发者工具
2. 按 `Ctrl+Shift+M` 切换到移动设备模式
3. 选择设备：iPhone 12 Pro
4. 按 `Ctrl+Shift+P` (Windows) 或 `Cmd+Shift+P` (Mac)
5. 输入 `screenshot`
6. 选择 `Capture full size screenshot`
7. 自动下载高清截图

### 系统截图工具

**Windows**:
- `Win+Shift+S` - 区域截图
- `Win+PrintScreen` - 全屏截图

**Mac**:
- `Cmd+Shift+4` - 区域截图
- `Cmd+Shift+3` - 全屏截图

**Linux**:
- `PrintScreen` - 全屏截图
- `Alt+PrintScreen` - 窗口截图
- `Shift+PrintScreen` - 区域截图

---

## 🎨 截图要求

### 移动端
- **尺寸**: 375x667px 或类似比例
- **格式**: PNG
- **内容**: 显示完整页面
- **大小**: < 500KB

### 管理后台
- **尺寸**: 1440x900px 或 1920x1080px
- **格式**: PNG
- **内容**: 显示完整功能区域
- **大小**: < 1MB

---

## ⚠️ 注意事项

1. **使用测试数据**: 确保没有敏感信息
2. **页面加载完成**: 等待页面完全加载后再截图
3. **避免弹窗**: 关闭所有弹窗和提示
4. **清晰可读**: 确保文字清晰可见
5. **统一风格**: 所有截图保持一致的风格

---

## 📞 需要帮助？

如果在截图或上传过程中遇到任何问题，请随时告诉我！

---

**创建时间**: 2026-03-24 18:00 GMT+8
