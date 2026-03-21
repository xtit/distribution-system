-- 分销系统数据库设计
-- 创建时间：2026-03-19

-- 创建数据库
CREATE DATABASE IF NOT EXISTS distribution_system 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

USE distribution_system;

-- ============================================
-- 1. 用户表 (users)
-- ============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    phone VARCHAR(20) UNIQUE COMMENT '手机号',
    email VARCHAR(100) UNIQUE COMMENT '邮箱',
    nickname VARCHAR(50) COMMENT '昵称',
    avatar_url VARCHAR(255) COMMENT '头像 URL',
    
    -- 分销相关
    referrer_id INT DEFAULT NULL COMMENT '上级用户 ID（推荐人）',
    referral_code VARCHAR(20) UNIQUE NOT NULL COMMENT '个人分销码',
    qr_code_url VARCHAR(255) COMMENT '个人二维码 URL',
    
    -- 账户信息
    balance DECIMAL(10, 2) DEFAULT 0.00 COMMENT '账户余额',
    total_commission DECIMAL(10, 2) DEFAULT 0.00 COMMENT '累计佣金',
    withdrawn_commission DECIMAL(10, 2) DEFAULT 0.00 COMMENT '已提现佣金',
    
    -- 状态
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-正常',
    is_admin TINYINT DEFAULT 0 COMMENT '是否管理员：0-否，1-是',
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
    
    -- 外键约束
    FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_referrer_id (referrer_id),
    INDEX idx_referral_code (referral_code),
    INDEX idx_username (username)
) ENGINE=InnoDB COMMENT='用户表';

-- ============================================
-- 2. 商品表 (products)
-- ============================================
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL COMMENT '商品名称',
    description TEXT COMMENT '商品描述',
    main_image VARCHAR(255) COMMENT '主图 URL',
    images JSON COMMENT '商品图片列表',
    
    -- 价格
    original_price DECIMAL(10, 2) NOT NULL COMMENT '原价',
    current_price DECIMAL(10, 2) NOT NULL COMMENT '现价',
    cost_price DECIMAL(10, 2) DEFAULT 0.00 COMMENT '成本价',
    
    -- 库存
    stock INT DEFAULT 0 COMMENT '库存数量',
    sold_count INT DEFAULT 0 COMMENT '已售数量',
    
    -- 分销设置
    commission_type ENUM('percentage', 'fixed') DEFAULT 'percentage' COMMENT '佣金类型：percentage-比例，fixed-固定金额',
    commission_value DECIMAL(10, 2) DEFAULT 0.00 COMMENT '佣金值：比例 (0-100) 或固定金额',
    
    -- 分销层级
    commission_levels JSON COMMENT '多级分销配置：[{"level":1,"rate":10},{"level":2,"rate":5}]',
    
    -- 状态
    status TINYINT DEFAULT 1 COMMENT '状态：0-下架，1-上架',
    is_hot TINYINT DEFAULT 0 COMMENT '是否热销：0-否，1-是',
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_is_hot (is_hot)
) ENGINE=InnoDB COMMENT='商品表';

-- ============================================
-- 3. 订单表 (orders)
-- ============================================
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '订单号',
    user_id INT NOT NULL COMMENT '购买用户 ID',
    
    -- 订单金额
    total_amount DECIMAL(10, 2) NOT NULL COMMENT '订单总金额',
    discount_amount DECIMAL(10, 2) DEFAULT 0.00 COMMENT '优惠金额',
    actual_amount DECIMAL(10, 2) NOT NULL COMMENT '实付金额',
    
    -- 佣金信息
    total_commission DECIMAL(10, 2) DEFAULT 0.00 COMMENT '订单总佣金',
    commission_status ENUM('pending', 'calculated', 'paid', 'cancelled') DEFAULT 'pending' COMMENT '佣金状态',
    
    -- 订单状态
    status ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled', 'refunded') DEFAULT 'pending' COMMENT '订单状态',
    
    -- 收货信息
    receiver_name VARCHAR(50) COMMENT '收货人姓名',
    receiver_phone VARCHAR(20) COMMENT '收货人电话',
    receiver_address VARCHAR(500) COMMENT '收货地址',
    
    -- 支付信息
    payment_method ENUM('wechat', 'alipay', 'card') COMMENT '支付方式',
    payment_time TIMESTAMP NULL COMMENT '支付时间',
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_order_no (order_no),
    INDEX idx_status (status),
    INDEX idx_payment_time (payment_time)
) ENGINE=InnoDB COMMENT='订单表';

-- ============================================
-- 4. 订单商品表 (order_items)
-- ============================================
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL COMMENT '订单 ID',
    product_id INT NOT NULL COMMENT '商品 ID',
    
    product_name VARCHAR(200) NOT NULL COMMENT '商品名称（快照）',
    product_image VARCHAR(255) COMMENT '商品图片（快照）',
    
    quantity INT NOT NULL COMMENT '购买数量',
    unit_price DECIMAL(10, 2) NOT NULL COMMENT '单价',
    subtotal DECIMAL(10, 2) NOT NULL COMMENT '小计',
    
    -- 佣金
    commission_amount DECIMAL(10, 2) DEFAULT 0.00 COMMENT '该商品产生的佣金',
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB COMMENT='订单商品表';

-- ============================================
-- 5. 分销关系表 (referrals)
-- ============================================
CREATE TABLE referrals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    referrer_id INT NOT NULL COMMENT '上级用户 ID（推荐人）',
    referee_id INT NOT NULL COMMENT '下级用户 ID（被推荐人）',
    level INT NOT NULL COMMENT '层级：1-直接下级，2-间接下级，以此类推',
    
    -- 关系路径（用于快速查询所有上级/下级）
    path VARCHAR(500) COMMENT '关系路径：如 1/5/10/23',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (referee_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_referrer_referee (referrer_id, referee_id),
    INDEX idx_referee_id (referee_id),
    INDEX idx_level (level)
) ENGINE=InnoDB COMMENT='分销关系表';

-- ============================================
-- 6. 佣金表 (commissions)
-- ============================================
CREATE TABLE commissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    commission_no VARCHAR(50) UNIQUE NOT NULL COMMENT '佣金编号',
    
    -- 关联
    user_id INT NOT NULL COMMENT '获得佣金的用户 ID',
    order_id INT NOT NULL COMMENT '关联订单 ID',
    product_id INT NOT NULL COMMENT '关联商品 ID',
    
    -- 佣金信息
    amount DECIMAL(10, 2) NOT NULL COMMENT '佣金金额',
    commission_rate DECIMAL(5, 2) COMMENT '佣金比例（如果是比例模式）',
    level INT NOT NULL COMMENT '分销层级：1-直接推荐，2-间接推荐',
    
    -- 状态
    status ENUM('pending', 'confirmed', 'paid', 'cancelled') DEFAULT 'pending' COMMENT '佣金状态',
    
    -- 描述
    description VARCHAR(500) COMMENT '佣金描述',
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP NULL COMMENT '确认时间',
    paid_at TIMESTAMP NULL COMMENT '发放时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_order_id (order_id),
    INDEX idx_status (status),
    INDEX idx_paid_at (paid_at)
) ENGINE=InnoDB COMMENT='佣金表';

-- ============================================
-- 7. 佣金发放记录表 (commission_payments)
-- ============================================
CREATE TABLE commission_payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_no VARCHAR(50) UNIQUE NOT NULL COMMENT '发放编号',
    
    user_id INT NOT NULL COMMENT '收款用户 ID',
    total_amount DECIMAL(10, 2) NOT NULL COMMENT '发放总金额',
    
    -- 佣金明细（JSON 存储本次发放的佣金 ID 列表）
    commission_ids JSON COMMENT '佣金 ID 列表',
    
    -- 提现信息
    withdrawal_method ENUM('wechat', 'alipay', 'bank') COMMENT '提现方式',
    withdrawal_account VARCHAR(100) COMMENT '提现账号',
    
    -- 状态
    status ENUM('pending', 'processing', 'completed', 'rejected') DEFAULT 'pending' COMMENT '发放状态',
    remark VARCHAR(500) COMMENT '备注（拒绝原因等）',
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL COMMENT '处理时间',
    processed_by INT COMMENT '处理人 ID（管理员）',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB COMMENT='佣金发放记录表';

-- ============================================
-- 8. 系统配置表 (system_configs)
-- ============================================
CREATE TABLE system_configs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) UNIQUE NOT NULL COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    config_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string' COMMENT '配置类型',
    description VARCHAR(255) COMMENT '配置描述',
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT COMMENT '最后更新人 ID',
    
    INDEX idx_config_key (config_key)
) ENGINE=InnoDB COMMENT='系统配置表';

-- ============================================
-- 9. 操作日志表 (operation_logs)
-- ============================================
CREATE TABLE operation_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT COMMENT '操作用户 ID',
    action VARCHAR(100) NOT NULL COMMENT '操作类型',
    module VARCHAR(50) COMMENT '模块',
    description VARCHAR(500) COMMENT '操作描述',
    request_data JSON COMMENT '请求数据',
    response_data JSON COMMENT '响应数据',
    ip_address VARCHAR(50) COMMENT 'IP 地址',
    user_agent VARCHAR(255) COMMENT '用户代理',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB COMMENT='操作日志表';

-- ============================================
-- 初始化数据
-- ============================================

-- 插入默认管理员账户（密码：admin123，实际使用时请修改）
INSERT INTO users (username, password_hash, nickname, is_admin, status, referral_code) 
VALUES ('admin', '$2b$10$YourHashedPasswordHere', '系统管理员', 1, 1, 'ADMIN001');

-- 插入系统配置
INSERT INTO system_configs (config_key, config_value, config_type, description) VALUES
('commission_settlement_days', '7', 'number', '佣金结算周期（天），订单完成后多少天发放佣金'),
('min_withdrawal_amount', '100', 'number', '最低提现金额'),
('max_commission_levels', '3', 'number', '最大分销层级'),
('default_commission_rate', '10', 'number', '默认佣金比例（%）'),
('wechat_appid', '', 'string', '微信公众号 AppID'),
('wechat_appsecret', '', 'string', '微信公众号 AppSecret');

-- ============================================
-- 视图：用户分销统计
-- ============================================
CREATE VIEW v_user_referral_stats AS
SELECT 
    u.id AS user_id,
    u.username,
    u.nickname,
    COUNT(DISTINCT r1.referee_id) AS direct_referrals,  -- 直接下级数量
    COUNT(DISTINCT r2.referee_id) AS indirect_referrals, -- 间接下级数量
    COUNT(DISTINCT c.id) AS total_commissions, -- 总佣金记录数
    COALESCE(SUM(c.amount), 0) AS total_earned, -- 累计赚取佣金
    COALESCE(SUM(CASE WHEN c.status = 'paid' THEN c.amount ELSE 0 END), 0) AS total_paid
FROM users u
LEFT JOIN referrals r1 ON u.id = r1.referrer_id AND r1.level = 1
LEFT JOIN referrals r2 ON u.id = r2.referrer_id AND r2.level > 1
LEFT JOIN commissions c ON u.id = c.user_id
WHERE u.status = 1
GROUP BY u.id, u.username, u.nickname;

-- ============================================
-- 视图：商品分销统计
-- ============================================
CREATE VIEW v_product_commission_stats AS
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.commission_type,
    p.commission_value,
    COUNT(DISTINCT oi.order_id) AS total_orders,
    SUM(oi.quantity) AS total_sold,
    COALESCE(SUM(oi.commission_amount), 0) AS total_commission_paid
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'completed'
WHERE p.status = 1
GROUP BY p.id, p.name, p.commission_type, p.commission_value;
