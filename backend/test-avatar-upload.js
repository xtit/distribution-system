// 测试头像上传和保存
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3010/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3NDA2MjgxNiwiZXhwIjoxNzc0NjY3NjE2fQ.5qSHh2WS_ImRuol6ncUt-1dadTF-Uci_fk5svegxm_U';

async function test() {
  try {
    console.log('1️⃣ 测试上传头像...');
    
    // 使用已有的图片
    const testImage = '/home/admin/openclaw/workspace/distribution-system/backend/uploads/image-1774060611340-212405546.png';
    
    if (!fs.existsSync(testImage)) {
      console.error('❌ 测试图片不存在:', testImage);
      return;
    }
    
    const formData = new FormData();
    formData.append('avatar', fs.createReadStream(testImage));
    
    const uploadRes = await axios.post(`${API_BASE}/auth/upload-avatar`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('✅ 上传成功:', uploadRes.data);
    const avatarUrl = uploadRes.data.data.url;
    
    console.log('\n2️⃣ 测试保存个人资料...');
    const profileRes = await axios.put(`${API_BASE}/auth/profile`, {
      nickname: '测试用户',
      avatarUrl: avatarUrl
    }, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 保存成功:', profileRes.data);
    console.log('\n3️⃣ 验证头像已保存...');
    
    const meRes = await axios.get(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('✅ 用户信息:', {
      nickname: meRes.data.data.user.nickname,
      avatarUrl: meRes.data.data.user.avatarUrl
    });
    
    console.log('\n✅ 测试完成！头像 URL:', avatarUrl);
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

test();
