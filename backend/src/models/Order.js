const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// 订单模型
const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderNo: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    field: 'order_no'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_amount'
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'discount_amount'
  },
  actualAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'actual_amount'
  },
  totalCommission: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'total_commission'
  },
  commissionStatus: {
    type: DataTypes.ENUM('pending', 'calculated', 'paid', 'cancelled'),
    defaultValue: 'pending',
    field: 'commission_status'
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled', 'refunded'),
    defaultValue: 'pending'
  },
  receiverName: {
    type: DataTypes.STRING(50),
    field: 'receiver_name'
  },
  receiverPhone: {
    type: DataTypes.STRING(20),
    field: 'receiver_phone'
  },
  receiverAddress: {
    type: DataTypes.STRING(500),
    field: 'receiver_address'
  },
  paymentMethod: {
    type: DataTypes.ENUM('wechat', 'alipay', 'card'),
    field: 'payment_method'
  },
  paymentTime: {
    type: DataTypes.DATE,
    field: 'payment_time'
  },
  shippingCompany: {
    type: DataTypes.STRING(50),
    field: 'shipping_company'
  },
  trackingNo: {
    type: DataTypes.STRING(100),
    field: 'tracking_no'
  },
  shippedAt: {
    type: DataTypes.DATE,
    field: 'shipped_at'
  },
  receivedAt: {
    type: DataTypes.DATE,
    field: 'received_at',
    comment: '用户确认收货时间'
  },
  completedAt: {
    type: DataTypes.DATE,
    field: 'completed_at',
    comment: '订单完成时间（收货后 15 天自动完成）'
  }
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  // 修复排序字段映射
  orderBy: 'created_at'
});

// 生成订单号
Order.generateOrderNo = function() {
  const now = new Date();
  const dateStr = now.toISOString().replace(/[-:T.]/g, '').substr(0, 14);
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `ORD${dateStr}${random}`;
};

module.exports = Order;
