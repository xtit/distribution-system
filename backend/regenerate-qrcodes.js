const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { User } = require('./src/models');
const { sequelize } = require('./src/config/database');

async function regenerateAllQRCodes() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    const users = await User.findAll();
    console.log(`📊 找到 ${users.length} 个用户`);
    
    const qrCodeDir = path.join(process.cwd(), 'qrcodes');
    if (!fs.existsSync(qrCodeDir)) {
      fs.mkdirSync(qrCodeDir, { recursive: true });
      console.log('📁 创建二维码目录');
    }
    
    const baseUrl = process.env.BASE_URL || 'http://localhost:3011';
    console.log(`🔗 使用 BASE_URL: ${baseUrl}`);
    
    for (const user of users) {
      const fileName = `user_${user.id}_${Date.now()}.png`;
      const filePath = path.join(qrCodeDir, fileName);
      const registerUrl = `${baseUrl}/register?ref=${user.referralCode}`;
      
      console.log(`\n📱 为用户 ${user.username} (ID: ${user.id}) 生成二维码:`);
      console.log(`   推荐码：${user.referralCode}`);
      console.log(`   注册链接：${registerUrl}`);
      
      await QRCode.toFile(filePath, registerUrl, {
        width: 300,
        margin: 2
      });
      
      const qrCodeUrl = `/qrcodes/${fileName}`;
      user.qrCodeUrl = qrCodeUrl;
      await user.save();
      
      console.log(`   ✅ 二维码已生成：${qrCodeUrl}`);
    }
    
    console.log('\n🎉 所有用户二维码已重新生成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 生成二维码失败:', error);
    process.exit(1);
  }
}

regenerateAllQRCodes();
