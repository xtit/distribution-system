/**
 * 更新商品主图
 * 使用方法：node src/scripts/update-product-images.js
 */

const { sequelize } = require('../config/database');

async function updateImages() {
  try {
    console.log('🚀 开始更新商品主图...');
    
    // 使用已有的上传图片
    const imageUrl = '/uploads/image-1774060611340-212405546.png';
    
    // 更新所有主图为 null 的商品
    const [updateCount] = await sequelize.query(`
      UPDATE products 
      SET main_image = :imageUrl 
      WHERE main_image IS NULL
    `, {
      replacements: { imageUrl },
      type: sequelize.QueryTypes.UPDATE
    });
    
    console.log(`✅ 成功更新 ${updateCount} 个商品的主图`);
    console.log(`📝 图片 URL: ${imageUrl}`);
    
  } catch (error) {
    console.error('❌ 更新失败:', error);
    throw error;
  }
}

// 执行脚本
if (require.main === module) {
  updateImages()
    .then(() => {
      console.log('✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = updateImages;
