#!/usr/bin/env python3
"""
导入本地数据到线上 Supabase 数据库
"""
import json
import os
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.exc import SQLAlchemyError

# Supabase 连接字符串
DATABASE_URL = os.environ.get('DATABASE_URL', 
    'postgresql://postgres.kdpgnhpfkyugrlnpmtju:JgdDwJ9iK2Df8hdu@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres')

EXPORT_FILE = os.path.join(os.path.dirname(__file__), 'local-data-export.json')

# 表名映射（SQLite 大写 → PostgreSQL 小写）
TABLE_MAPPING = {
    'Users': 'users',
    'Products': 'products',
    'Orders': 'orders',
    'OrderItems': 'order_items',
    'Commissions': 'commissions',
    'Referrals': 'referrals',
    'Configs': 'configs'
}

# 字段名映射（驼峰 → 蛇形）
FIELD_MAPPING = {
    'userId': 'user_id',
    'productId': 'product_id',
    'orderId': 'order_id',
    'orderNo': 'order_no',
    'totalAmount': 'total_amount',
    'discountAmount': 'discount_amount',
    'actualAmount': 'actual_amount',
    'totalCommission': 'total_commission',
    'commissionType': 'commission_type',
    'commissionValue': 'commission_value',
    'commissionRate': 'commission_rate',
    'expectedCommission': 'expected_commission',
    'actualCommission': 'actual_commission',
    'paidCommission': 'paid_commission',
    'paidAt': 'paid_at',
    'originalPrice': 'original_price',
    'currentPrice': 'current_price',
    'costPrice': 'cost_price',
    'isHot': 'is_hot',
    'status': 'status',
    'referrerId': 'referrer_id',
    'refereeId': 'referee_id',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at',
    'lastLoginAt': 'last_login_at',
    'isAdmin': 'is_admin',
    'nickname': 'nickname',
    'avatarUrl': 'avatar_url',
    'referralCode': 'referral_code',
    'qrCodeUrl': 'qr_code_url',
    'totalCommission': 'total_commission',
    'withdrawnCommission': 'withdrawn_commission',
    'balance': 'balance',
    'shippingAddress': 'shipping_address',
    'shippingCompany': 'shipping_company',
    'trackingNo': 'tracking_no',
    'shippedAt': 'shipped_at',
    'receivedAt': 'received_at',
    'paidAt': 'paid_at'
}

print('🚀 开始导入数据到线上数据库...\n')
print(f'📤 源文件：{EXPORT_FILE}')
print(f'📥 目标：{DATABASE_URL.replace("://", "://***:***@")}\n')

def convert_field_name(name):
    """转换字段名：驼峰 → 蛇形"""
    return FIELD_MAPPING.get(name, name)

def convert_row_data(row):
    """转换行数据"""
    converted = {}
    for key, value in row.items():
        new_key = convert_field_name(key)
        # 处理 None 和字符串 'null'
        if value == 'null' or value == 'None':
            converted[new_key] = None
        else:
            converted[new_key] = value
    return converted

try:
    # 读取导出的 JSON
    with open(EXPORT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 创建数据库引擎
    engine = create_engine(DATABASE_URL, 
                          connect_args={'sslmode': 'require', 
                                       'sslrootcert': None,
                                       'connect_timeout': 30})
    
    print('✅ 数据库连接成功\n')
    
    # 检查线上数据库表结构
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    print(f'📋 线上数据库现有表：{", ".join(existing_tables)}\n')
    
    # 导入每个表
    total_imported = 0
    total_skipped = 0
    total_errors = 0
    
    with engine.connect() as conn:
        for sqlite_table, rows in data.items():
            # 转换为 PostgreSQL 表名
            pg_table = TABLE_MAPPING.get(sqlite_table, sqlite_table.lower())
            
            print(f'📊 导入表：{sqlite_table} → {pg_table}...')
            
            if not rows:
                print(f'   ⏭️  空数据，跳过\n')
                continue
            
            # 检查表是否存在
            if pg_table not in existing_tables:
                print(f'   ⚠️  表不存在，跳过\n')
                continue
            
            success_count = 0
            skip_count = 0
            error_count = 0
            
            for row in rows:
                try:
                    # 转换字段名
                    converted_row = convert_row_data(row)
                    
                    # 移除 id 字段（让数据库自增）
                    if 'id' in converted_row:
                        del converted_row['id']
                    
                    # 构建 WHERE 条件检查是否已存在
                    where_clause = ''
                    params = {}
                    
                    if pg_table == 'users':
                        where_clause = 'username = :username'
                        params = {'username': converted_row.get('username')}
                    elif pg_table == 'products':
                        where_clause = 'name = :name'
                        params = {'name': converted_row.get('name')}
                    elif pg_table == 'orders':
                        where_clause = 'order_no = :order_no'
                        params = {'order_no': converted_row.get('order_no')}
                    
                    # 检查是否已存在
                    if where_clause and params.get(list(params.keys())[0]):
                        check_sql = f'SELECT 1 FROM "{pg_table}" WHERE {where_clause}'
                        result = conn.execute(text(check_sql), params).fetchone()
                        if result:
                            skip_count += 1
                            continue
                    
                    # 插入数据
                    columns = list(converted_row.keys())
                    columns_str = ', '.join([f'"{col}"' for col in columns])
                    placeholders = ', '.join([f':{col}' for col in columns])
                    insert_sql = f'INSERT INTO "{pg_table}" ({columns_str}) VALUES ({placeholders})'
                    
                    conn.execute(text(insert_sql), converted_row)
                    success_count += 1
                    
                except SQLAlchemyError as e:
                    error_msg = str(e)
                    if 'duplicate' in error_msg.lower() or 'unique' in error_msg.lower():
                        skip_count += 1
                    else:
                        print(f'   ❌ 错误：{error_msg[:200]}')
                        error_count += 1
                except Exception as e:
                    print(f'   ❌ 错误：{e}')
                    error_count += 1
            
            # 提交事务
            conn.commit()
            
            print(f'   ✅ 成功：{success_count} 条，跳过：{skip_count} 条，失败：{error_count} 条\n')
            
            total_imported += success_count
            total_skipped += skip_count
            total_errors += error_count
    
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    print('📊 导入完成汇总：')
    print(f'   ✅ 成功导入：{total_imported} 条记录')
    print(f'   ⏭️  跳过：{total_skipped} 条记录')
    print(f'   ❌ 失败：{total_errors} 条记录')
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    engine.dispose()
    
except FileNotFoundError:
    print(f'❌ 找不到导出文件：{EXPORT_FILE}')
    print('请先运行：python3 export-data.py\n')
    exit(1)
except Exception as e:
    print(f'❌ 导入失败：{e}\n')
    import traceback
    traceback.print_exc()
    exit(1)
