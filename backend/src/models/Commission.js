const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// 佣金模型
const Commission = sequelize.define('Commission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  commissionNo: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    field: 'commission_no'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'order_id'
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'product_id'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  commissionRate: {
    type: DataTypes.DECIMAL(5, 2),
    field: 'commission_rate'
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'frozen', 'confirmed', 'paid', 'cancelled'),
    defaultValue: 'pending',
    comment: 'pending-待结算，frozen-冻结中，confirmed-可提现，paid-已提现，cancelled-已取消'
  },
  description: {
    type: DataTypes.STRING(500)
  },
  frozenAt: {
    type: DataTypes.DATE,
    field: 'frozen_at',
    comment: '冻结时间（订单确认收货时）'
  },
  unlockAt: {
    type: DataTypes.DATE,
    field: 'unlock_at',
    comment: '解冻时间（收货后 15 天）'
  },
  confirmedAt: {
    type: DataTypes.DATE,
    field: 'confirmed_at',
    comment: '确认可提现时间'
  },
  paidAt: {
    type: DataTypes.DATE,
    field: 'paid_at',
    comment: '提现时间'
  }
}, {
  tableName: 'commissions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 生成佣金编号
Commission.generateCommissionNo = function() {
  const now = new Date();
  const dateStr = now.toISOString().replace(/[-:T.]/g, '').substr(0, 14);
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `COM${dateStr}${random}`;
};

module.exports = Commission;
