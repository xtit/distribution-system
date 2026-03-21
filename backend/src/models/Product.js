const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// 商品模型
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  mainImage: {
    type: DataTypes.STRING(255),
    field: 'main_image'
  },
  images: {
    type: DataTypes.JSON
  },
  originalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'original_price'
  },
  currentPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'current_price'
  },
  costPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'cost_price'
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  soldCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sold_count'
  },
  commissionType: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    defaultValue: 'percentage',
    field: 'commission_type'
  },
  commissionValue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'commission_value'
  },
  commissionLevels: {
    type: DataTypes.JSON,
    field: 'commission_levels'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  },
  isHot: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'is_hot'
  },
  deletedAt: {
    type: DataTypes.DATE,
    field: 'deleted_at'
  }
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true // 启用软删除
});

// 实例方法：计算佣金
Product.prototype.calculateCommission = function(price) {
  if (this.commissionType === 'fixed') {
    return parseFloat(this.commissionValue);
  } else {
    return price * (parseFloat(this.commissionValue) / 100);
  }
};

module.exports = Product;
