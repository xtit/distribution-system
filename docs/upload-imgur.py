#!/usr/bin/env python3
import requests
import os

# Imgur API Client ID
CLIENT_ID = '8c56e380e28b8b5'

# 图片文件列表
images = {
    'admin-login': '/home/admin/.openclaw/media/inbound/截图_1774346990790---28bb44dc-1d4c-4489-8893-f74f720dddf4.png',
    'admin-settings': '/home/admin/.openclaw/media/inbound/截图_1774347144101---7c6067d4-a18d-4dbb-a2df-bb08f167e308.png',
    'mobile-home': '/home/admin/.openclaw/media/inbound/截图_1774347183717---eece2578-4953-4e05-867b-e04021a8cc8f.png',
    'mobile-orders': '/home/admin/.openclaw/media/inbound/截图_1774347207849---da89f1cd-2eaf-4e5c-9633-9b350679b5e1.png',
    'mobile-profile': '/home/admin/.openclaw/media/inbound/截图_1774347227939---18f4e2c8-0d1a-47cc-8756-4586a9e38119.png'
}

headers = {
    'Authorization': f'Client-ID {CLIENT_ID}'
}

print('开始上传图片到 Imgur...\n')

for name, filepath in images.items():
    if not os.path.exists(filepath):
        print(f'❌ 文件不存在：{filepath}')
        continue
    
    try:
        print(f'正在上传：{name}...')
        with open(filepath, 'rb') as f:
            response = requests.post(
                'https://api.imgur.com/3/image.json',
                headers=headers,
                files={'image': f},
                timeout=30
            )
        
        data = response.json()
        if data.get('success'):
            link = data['data']['link']
            print(f'✅ {name}: {link}')
        else:
            print(f'❌ 上传失败：{data}')
    except Exception as e:
        print(f'❌ 错误：{e}')

print('\n完成！')
