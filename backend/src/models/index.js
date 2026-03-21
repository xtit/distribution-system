const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Commission = require('./Commission');
const Referral = require('./Referral');

// 用户关联
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Commission, { foreignKey: 'userId', as: 'commissions' });
Commission.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 用户自关联（上下线关系）
User.hasMany(User, { foreignKey: 'referrerId', as: 'referees' });
User.belongsTo(User, { foreignKey: 'referrerId', as: 'referrer' });

// 分销关系
User.hasMany(Referral, { foreignKey: 'referrerId', as: 'referrals' });
User.hasMany(Referral, { foreignKey: 'refereeId', as: 'referredBy' });
Referral.belongsTo(User, { foreignKey: 'referrerId', as: 'referrer' });
Referral.belongsTo(User, { foreignKey: 'refereeId', as: 'referee' });

// 订单与商品
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// 订单与佣金
Order.hasMany(Commission, { foreignKey: 'orderId', as: 'commissions' });
Commission.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// 商品与佣金
Product.hasMany(Commission, { foreignKey: 'productId', as: 'commissions' });
Commission.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = {
  User,
  Product,
  Order,
  OrderItem,
  Commission,
  Referral
};
