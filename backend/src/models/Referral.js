const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// 分销关系模型
const Referral = sequelize.define('Referral', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  referrerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'referrer_id'
  },
  refereeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'referee_id'
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  path: {
    type: DataTypes.STRING(500)
  }
}, {
  tableName: 'referrals',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Referral;
