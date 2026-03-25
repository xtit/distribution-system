const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

// 用户模型
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    field: 'password_hash',
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true
  },
  nickname: {
    type: DataTypes.STRING(50)
  },
  avatarUrl: {
    type: DataTypes.TEXT,
    field: 'avatar_url'
  },
  referrerId: {
    type: DataTypes.INTEGER,
    field: 'referrer_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  referralCode: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
    field: 'referral_code'
  },
  qrCodeUrl: {
    type: DataTypes.STRING(255),
    field: 'qr_code_url'
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  totalCommission: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'total_commission'
  },
  withdrawnCommission: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'withdrawn_commission'
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  isAdmin: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'is_admin'
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    field: 'last_login_at'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 密码加密钩子
User.beforeCreate(async (user) => {
  if (user.passwordHash) {
    user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('passwordHash')) {
    user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
  }
});

// 实例方法：验证密码
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

// 实例方法：生成推荐码
User.generateReferralCode = function() {
  return 'REF' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
};

module.exports = User;
