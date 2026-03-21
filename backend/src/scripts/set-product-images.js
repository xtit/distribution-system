/**
 * 为每个商品设置不同的图片
 * 使用方法：node src/scripts/set-product-images.js
 */

const { sequelize } = require('../config/database');

// 商品图片映射（使用不同的占位图，实际应该上传真实商品图片）
const productImages = {
  // 茶叶礼盒 - 绿色/茶叶相关
  1: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde3?w=400&h=400&fit=crop',
  
  // 智能手表 - 科技/蓝色
  2: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
  
  // 无线蓝牙耳机 - 白色/简洁
  3: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
  
  // 便携充电宝 - 小巧/便携
  4: 'https://images.unsplash.com/photo-1609592425066-5c74e7976f24?w=400&h=400&fit=crop',
  
  // 测试商品 - 通用
  5: 'https://images.unsplash.com/photo-1526178610171-1a44f12b0b8e?w=400&h=400&fit=crop',
  
  // 新品 - 新鲜/绿色
  6: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop',
  
  // 手表 - 奢侈品/金色
  7: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop'
};

async function setProductImages() {
  try {
    console.log('🚀 开始设置商品图片...');
    
    let updatedCount = 0;
    
    for (const [productId, imageUrl] of Object.entries(productImages)) {
      const [result] = await sequelize.query(`
        UPDATE products 
        SET main_image = :imageUrl 
        WHERE id = :productId
      `, {
        replacements: { imageUrl, productId },
        type: sequelize.QueryTypes.UPDATE
      });
      
      if (result) {
        console.log(`✅ 商品 ${productId}: ${imageUrl}`);
        updatedCount++;
      }
    }
    
    console.log(`\n✅ 成功更新 ${updatedCount} 个商品的图片`);
    console.log('📝 提示：生产环境应该上传真实商品图片到服务器');
    
  } catch (error) {
    console.error('❌ 更新失败:', error);
    throw error;
  }
}

// 执行脚本
if (require.main === module) {
  setProductImages()
    .then(() => {
      console.log('✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = setProductImages;
