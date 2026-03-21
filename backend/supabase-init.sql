-- Supabase PostgreSQL 初始化脚本
-- 在 Supabase SQL Editor 中执行

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  nickname VARCHAR(50),
  avatar_url VARCHAR(255),
  referrer_id INTEGER REFERENCES users(id),
  referral_code VARCHAR(20) UNIQUE,
  qr_code_url VARCHAR(255),
  balance DECIMAL(10,2) DEFAULT 0,
  total_commission DECIMAL(10,2) DEFAULT 0,
  withdrawn_commission DECIMAL(10,2) DEFAULT 0,
  status INTEGER DEFAULT 1,
  is_admin BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建商品表
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  main_image VARCHAR(255),
  images JSON,
  original_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  sold_count INTEGER DEFAULT 0,
  commission_type VARCHAR(20) DEFAULT 'percentage',
  commission_value DECIMAL(10,2) DEFAULT 0,
  commission_levels JSON,
  status INTEGER DEFAULT 1,
  is_hot INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建订单表
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_no VARCHAR(50) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  actual_amount DECIMAL(10,2) NOT NULL,
  total_commission DECIMAL(10,2) DEFAULT 0,
  commission_status VARCHAR(20) DEFAULT 'calculated',
  status VARCHAR(20) DEFAULT 'pending',
  receiver_name VARCHAR(100),
  receiver_phone VARCHAR(20),
  receiver_address TEXT,
  payment_method VARCHAR(20),
  payment_time TIMESTAMP,
  shipping_company VARCHAR(50),
  tracking_no VARCHAR(100),
  shipped_at TIMESTAMP,
  received_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建订单项表
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  product_name VARCHAR(200),
  product_image VARCHAR(255),
  quantity INTEGER,
  unit_price DECIMAL(10,2),
  subtotal DECIMAL(10,2),
  commission_amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建佣金表
CREATE TABLE IF NOT EXISTS commissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  paid_at TIMESTAMP,
  frozen_at TIMESTAMP,
  unlock_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建分销关系表
CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  referrer_id INTEGER REFERENCES users(id),
  referee_id INTEGER REFERENCES users(id),
  level INTEGER,
  path TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(referrer_id, referee_id, level)
);

-- 创建索引
CREATE INDEX idx_users_referrer ON users(referrer_id);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_commissions_user ON commissions(user_id);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);

-- 插入默认管理员账号
INSERT INTO users (username, password_hash, nickname, phone, email, is_admin, referral_code)
VALUES (
  'admin',
  '$2a$10$SKkQPTiOCeh/F/uHczyRa.tzY4TV3ZYQnZbMfteP3iJzHtmC6s8eW',
  '系统管理员',
  '13800000000',
  'admin@example.com',
  TRUE,
  'ADMIN001'
) ON CONFLICT (username) DO NOTHING;
