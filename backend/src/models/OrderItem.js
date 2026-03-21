const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// 订单商品模型
const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  productName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'product_name'
  },
  productImage: {
    type: DataTypes.STRING(255),
    field: 'product_image'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'unit_price'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  commissionAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'commission_amount'
  }
}, {
  tableName: 'order_items',
  timestamps: false
});

module.exports = OrderItem;
