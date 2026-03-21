/**
 * 更新特定商品的图片
 * 使用方法：node src/scripts/update-specific-images.js
 */

const { sequelize } = require('../config/database');

// 更新茶叶礼盒和充电宝的图片
const updates = {
  // 精品茶叶礼盒 - 高档茶叶包装
  1: 'https://images.unsplash.com/photo-1563911892437-1feda9d5c442?w=800&h=800&fit=crop',
  
  // 便携充电宝 - 小巧便携
  4: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&h=800&fit=crop'
};

async function updateImages() {
  try {
    console.log('🚀 开始更新商品图片...\n');
    
    for (const [productId, imageUrl] of Object.entries(updates)) {
      const [result] = await sequelize.query(`
        UPDATE products 
        SET main_image = :imageUrl 
        WHERE id = :productId
      `, {
        replacements: { imageUrl, productId },
        type: sequelize.QueryTypes.UPDATE
      });
      
      const productName = productId == 1 ? '精品茶叶礼盒' : '便携充电宝';
      console.log(`✅ ${productName} (ID:${productId})`);
      console.log(`   图片：${imageUrl}\n`);
    }
    
    console.log('✅ 图片更新完成！');
    
  } catch (error) {
    console.error('❌ 更新失败:', error);
    throw error;
  }
}

// 执行脚本
if (require.main === module) {
  updateImages()
    .then(() => {
      console.log('\n✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = updateImages;
