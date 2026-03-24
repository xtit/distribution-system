#!/usr/bin/env python3
"""
导出本地 SQLite 数据为 JSON
"""
import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'data/distribution.db')
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), 'local-data-export.json')

TABLES = ['Users', 'Products', 'Orders', 'OrderItems', 'Commissions', 'Referrals', 'Configs']

print('📤 导出本地数据库...\n')

try:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    export_data = {}
    
    for table in TABLES:
        print(f'📊 导出表：{table}...')
        try:
            cursor.execute(f'SELECT * FROM {table}')
            rows = cursor.fetchall()
            # 转换为字典列表
            data = [dict(row) for row in rows]
            export_data[table] = data
            print(f'   ✅ {len(data)} 条记录\n')
        except sqlite3.OperationalError as e:
            print(f'   ⚠️  表不存在：{e}\n')
            export_data[table] = []
    
    conn.close()
    
    # 保存到文件
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(export_data, f, ensure_ascii=False, indent=2)
    
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    print(f'✅ 导出完成：{OUTPUT_FILE}')
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
except Exception as e:
    print(f'❌ 导出失败：{e}\n')
    exit(1)
