// 重新生成所有用户的二维码
const { User } = require('./src/models');
const QRCode = require('qrcode');
require('dotenv').config();

async function regenerateAllQRCodes() {
  try {
    console.log('🔄 开始重新生成所有用户的二维码...\n');
    
    const frontendUrl = process.env.FRONTEND_URL || 'https://distribution-system-psi.vercel.app';
    console.log(`使用前端地址：${frontendUrl}\n`);
    
    const users = await User.findAll({
      where: { status: 1 }
    });
    
    console.log(`找到 ${users.length} 个活跃用户\n`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const user of users) {
      try {
        const registerUrl = `${frontendUrl}/register?ref=${user.referralCode}`;
        console.log(`用户 ${user.username} (${user.referralCode}): ${registerUrl}`);
        
        const qrCodeBase64 = await QRCode.toDataURL(registerUrl, {
          width: 300,
          margin: 2
        });
        
        user.qrCodeUrl = qrCodeBase64;
        await user.save();
        
        updated++;
        console.log(`  ✅ 更新成功\n`);
        
      } catch (error) {
        console.log(`  ❌ 失败：${error.message}\n`);
        skipped++;
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 完成：更新 ${updated} 个，跳过 ${skipped} 个`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

regenerateAllQRCodes();
