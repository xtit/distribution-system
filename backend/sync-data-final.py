#!/usr/bin/env python3
"""
数据同步脚本 - 智能处理表结构差异
"""
import json
import os
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.exc import SQLAlchemyError

DATABASE_URL = os.environ.get('DATABASE_URL', 
    'postgresql://postgres.kdpgnhpfkyugrlnpmtju:JgdDwJ9iK2Df8hdu@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres')

EXPORT_FILE = os.path.join(os.path.dirname(__file__), 'local-data-export.json')

# 表名映射
TABLE_MAPPING = {
    'Users': 'users',
    'Products': 'products',
    'Orders': 'orders',
    'OrderItems': 'order_items',
    'Commissions': 'commissions',
    'Referrals': 'referrals'
}

# 字段类型转换
TYPE_CONVERSIONS = {
    'users': {
        'is_admin': lambda x: bool(x) if x is not None else False,
        'status': lambda x: int(x) if x is not None else 1
    },
    'products': {
        'is_hot': lambda x: int(x) if x is not None else 0,
        'status': lambda x: int(x) if x is not None else 1
    }
}

# 线上数据库没有的字段（需要过滤）
SKIP_FIELDS = {
    'products': ['deleted_at']
}

print('🚀 开始智能数据同步...\n')

def convert_field_name(name):
    """驼峰转蛇形"""
    import re
    # 常见映射
    mappings = {
        'userId': 'user_id', 'productId': 'product_id', 'orderId': 'order_id',
        'orderNo': 'order_no', 'totalAmount': 'total_amount',
        'discountAmount': 'discount_amount', 'actualAmount': 'actual_amount',
        'totalCommission': 'total_commission', 'commissionType': 'commission_type',
        'commissionValue': 'commission_value', 'paidAt': 'paid_at',
        'originalPrice': 'original_price', 'currentPrice': 'current_price',
        'costPrice': 'cost_price', 'isHot': 'is_hot',
        'referrerId': 'referrer_id', 'refereeId': 'referee_id',
        'createdAt': 'created_at', 'updatedAt': 'updated_at',
        'lastLoginAt': 'last_login_at', 'isAdmin': 'is_admin',
        'nickname': 'nickname', 'avatarUrl': 'avatar_url',
        'referralCode': 'referral_code', 'qrCodeUrl': 'qr_code_url',
        'withdrawnCommission': 'withdrawn_commission',
        'shippingAddress': 'shipping_address', 'shippingCompany': 'shipping_company',
        'trackingNo': 'tracking_no', 'shippedAt': 'shipped_at',
        'receivedAt': 'received_at'
    }
    return mappings.get(name, name)

def convert_row_data(row, table_name):
    """转换并过滤字段"""
    converted = {}
    skip_fields = SKIP_FIELDS.get(table_name, [])
    type_conversions = TYPE_CONVERSIONS.get(table_name, {})
    
    for key, value in row.items():
        # 跳过不需要的字段
        if key in skip_fields:
            continue
        
        new_key = convert_field_name(key)
        
        # 类型转换
        if new_key in type_conversions:
            try:
                converted[new_key] = type_conversions[new_key](value)
            except:
                converted[new_key] = type_conversions[new_key](0)
        else:
            # 处理 None 和字符串
            if value == 'null' or value == 'None':
                converted[new_key] = None
            else:
                converted[new_key] = value
    
    return converted

try:
    # 读取数据
    with open(EXPORT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 连接数据库
    engine = create_engine(DATABASE_URL, 
                          connect_args={'sslmode': 'require', 
                                       'connect_timeout': 30})
    
    print('✅ 数据库连接成功\n')
    
    # 获取表结构
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    # 获取每个表的列
    table_columns = {}
    for table in existing_tables:
        columns = [col['name'] for col in inspector.get_columns(table)]
        table_columns[table] = columns
        print(f'📋 {table}: {len(columns)} 列')
    print('')
    
    # 导入数据
    total_imported = 0
    total_skipped = 0
    total_errors = 0
    
    with engine.connect() as conn:
        for sqlite_table, rows in data.items():
            pg_table = TABLE_MAPPING.get(sqlite_table, sqlite_table.lower())
            
            print(f'📊 同步：{sqlite_table} → {pg_table}...')
            
            if not rows:
                print(f'   ⏭️  空数据\n')
                continue
            
            if pg_table not in existing_tables:
                print(f'   ⚠️  表不存在\n')
                continue
            
            # 获取线上表的列
            pg_columns = set(table_columns.get(pg_table, []))
            
            success_count = 0
            skip_count = 0
            error_count = 0
            
            for row in rows:
                try:
                    # 转换数据
                    converted = convert_row_data(row, sqlite_table.lower())
                    
                    # 只保留线上数据库存在的列
                    filtered = {k: v for k, v in converted.items() if k in pg_columns}
                    
                    # 移除 id
                    if 'id' in filtered:
                        del filtered['id']
                    
                    # 检查是否已存在
                    where_clause = ''
                    params = {}
                    
                    if pg_table == 'users':
                        where_clause = 'username = :username'
                        params = {'username': filtered.get('username')}
                    elif pg_table == 'products':
                        where_clause = 'name = :name'
                        params = {'name': filtered.get('name')}
                    elif pg_table == 'orders':
                        where_clause = 'order_no = :order_no'
                        params = {'order_no': filtered.get('order_no')}
                    
                    # 检查是否存在
                    if where_clause and params.get(list(params.keys())[0]):
                        check_sql = f'SELECT 1 FROM "{pg_table}" WHERE {where_clause}'
                        result = conn.execute(text(check_sql), params).fetchone()
                        if result:
                            skip_count += 1
                            continue
                    
                    # 插入
                    if filtered:
                        columns = list(filtered.keys())
                        columns_str = ', '.join([f'"{col}"' for col in columns])
                        placeholders = ', '.join([f':{col}' for col in columns])
                        insert_sql = f'INSERT INTO "{pg_table}" ({columns_str}) VALUES ({placeholders})'
                        
                        conn.execute(text(insert_sql), filtered)
                        success_count += 1
                    
                except SQLAlchemyError as e:
                    error_msg = str(e)
                    if 'duplicate' in error_msg.lower() or 'unique' in error_msg.lower():
                        skip_count += 1
                    elif 'foreign key' in error_msg.lower():
                        print(f'   ⚠️  外键约束失败（跳过）')
                        skip_count += 1
                    else:
                        print(f'   ❌ {error_msg[:100]}')
                        error_count += 1
                except Exception as e:
                    print(f'   ❌ {e}')
                    error_count += 1
            
            conn.commit()
            print(f'   ✅ {success_count} 条，⏭️ {skip_count} 条，❌ {error_count} 条\n')
            
            total_imported += success_count
            total_skipped += skip_count
            total_errors += error_count
    
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    print('📊 同步完成：')
    print(f'   ✅ 成功：{total_imported} 条')
    print(f'   ⏭️  跳过：{total_skipped} 条')
    print(f'   ❌ 失败：{total_errors} 条')
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    engine.dispose()
    
except Exception as e:
    print(f'❌ 失败：{e}\n')
    import traceback
    traceback.print_exc()
    exit(1)
