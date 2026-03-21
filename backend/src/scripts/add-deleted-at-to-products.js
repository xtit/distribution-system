/**
 * 为 products 表添加 deleted_at 字段（软删除支持）
 * 使用方法：node src/scripts/add-deleted-at-to-products.js
 */

const { sequelize } = require('../config/database');

async function migrate() {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    console.log('🚀 开始迁移：为 products 表添加 deleted_at 字段...');
    
    // 检查字段是否已存在
    const tableDescription = await queryInterface.describeTable('products');
    
    if (tableDescription.deleted_at) {
      console.log('✅ deleted_at 字段已存在，跳过迁移');
      return;
    }
    
    // 添加 deleted_at 字段
    await queryInterface.addColumn('products', 'deleted_at', {
      type: 'DATETIME',
      allowNull: true
    });
    
    console.log('✅ 成功添加 deleted_at 字段');
    console.log('📝 提示：现在商品删除功能将使用软删除，商品会移入回收站而不是直接删除');
    
  } catch (error) {
    console.error('❌ 迁移失败:', error);
    throw error;
  }
}

// 执行迁移
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('✅ 迁移完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 迁移错误:', error);
      process.exit(1);
    });
}

module.exports = migrate;
