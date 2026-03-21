# 管理后台数据统计 Bug 修复报告

**修复时间**: 2026-03-21  
**修复人**: 徐小呆

---

## 🐛 问题描述

用户反馈：管理后台首页的汇总数据不正确。

## 🔍 问题分析

### 问题现象

访问数据统计接口返回：
```json
{
  "sales": {
    "total": 0,      // ❌ 实际有订单，但销售额为 0
    "today": 0
  },
  "products": {
    "total": 5       // ✅ 正确
  }
}
```

### 根本原因

**1. 销售额统计范围过窄**

原代码只统计状态为 `completed` 或 `paid` 的订单：
```javascript
const totalSales = await Order.sum('actual_amount', {
  where: { status: { [Op.in]: ['completed', 'paid'] } }
});
```

但实际订单状态包括：
- `pending` - 待支付
- `paid` - 已支付
- `shipped` - 已发货 ✅ **订单当前状态**
- `completed` - 已完成
- `cancelled` - 已取消
- `refunded` - 已退款

**问题**: 已发货（`shipped`）的订单没有被统计！

**2. 商品统计未考虑软删除**

原代码：
```javascript
const totalProducts = await Product.count({ where: { status: 1 } });
```

**问题**: 没有使用 `paranoid: true`，可能统计到已删除的商品。

## ✅ 修复方案

### 1️⃣ 销售额统计修复

**修改内容**: 将 `shipped` 状态加入统计范围

```javascript
// 修复前
const totalSales = await Order.sum('actual_amount', {
  where: { status: { [Op.in]: ['completed', 'paid'] } }
});

// 修复后
const totalSales = await Order.sum('actual_amount', {
  where: { 
    status: { [Op.in]: ['paid', 'shipped', 'completed'] } 
  }
});
```

**理由**: 
- `paid` - 已支付，应计入销售额
- `shipped` - 已发货，交易实质已完成，应计入
- `completed` - 已完成，应计入
- `pending` - 待支付，未付款，不计入
- `cancelled/refunded` - 已取消/退款，不计入

### 2️⃣ 商品统计修复

**修改内容**: 添加 `paranoid: true` 排除已删除商品

```javascript
// 修复前
const totalProducts = await Product.count({ 
  where: { status: 1 } 
});

// 修复后
const totalProducts = await Product.count({ 
  where: { status: 1 },
  paranoid: true // 只统计未删除的商品
});
```

## 📊 修复效果

### 修复前
```json
{
  "users": { "total": 3, "newToday": 0 },
  "orders": { "total": 2, "today": 0 },
  "sales": { "total": 0, "today": 0 },    // ❌ 错误
  "commissions": { "paid": 0, "pending": 0 },
  "products": { "total": 5 }
}
```

### 修复后
```json
{
  "users": { "total": 3, "newToday": 0 },
  "orders": { "total": 2, "today": 0 },
  "sales": { "total": 718, "today": 0 },  // ✅ 正确 (359 × 2)
  "commissions": { "paid": 0, "pending": 0 },
  "products": { "total": 5 }
}
```

## 📁 修改文件

### backend/src/controllers/adminController.js

**修改位置**: `getDashboard` 函数

**修改内容**:
1. 销售额统计：添加 `shipped` 状态
2. 商品统计：添加 `paranoid: true`

```javascript
// 销售金额统计（统计已支付、已发货、已完成的订单）
const totalSales = await Order.sum('actual_amount', {
  where: { 
    status: { [Op.in]: ['paid', 'shipped', 'completed'] } 
  }
});
const todaySales = await Order.sum('actual_amount', {
  where: {
    status: { [Op.in]: ['paid', 'shipped', 'completed'] },
    created_at: {
      [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
    }
  }
});

// 商品统计（统计上架的商品）
const totalProducts = await Product.count({ 
  where: { status: 1 },
  paranoid: true // 只统计未删除的商品
});
```

## 🎯 订单状态说明

| 状态 | 英文 | 是否计入销售额 | 说明 |
|------|------|---------------|------|
| 待支付 | pending | ❌ | 用户未付款 |
| 已支付 | paid | ✅ | 用户已付款 |
| 已发货 | shipped | ✅ | 商家已发货 |
| 已完成 | completed | ✅ | 交易完成 |
| 已取消 | cancelled | ❌ | 订单已取消 |
| 已退款 | refunded | ❌ | 已退款订单 |

## 🚀 测试步骤

1. **重启后端服务**
```bash
cd /home/admin/openclaw/workspace/distribution-system/backend
node src/index.js
```

2. **访问数据统计接口**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
curl -X GET http://localhost:3010/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

3. **验证数据**
- ✅ 销售额 = 所有已支付/已发货/已完成订单的金额总和
- ✅ 商品数 = 上架且未删除的商品数量

## 📝 后续优化建议

1. **今日数据优化**: 当前 `today` 统计基于 `created_at`，建议改为基于 `payment_time`
2. **佣金统计**: 考虑将 `calculated` 状态的佣金也计入待发放
3. **数据缓存**: 统计数据可缓存，避免每次刷新都查询数据库
4. **趋势图表**: 添加销售趋势、订单趋势等图表
5. **导出功能**: 支持导出统计数据为 Excel

---

**状态**: ✅ 已修复  
**测试**: ✅ 通过  
**上线**: 待部署
