/**
 * 验证商品简介更新结果
 */

const { sequelize } = require('../config/database');
const Product = require('../models/Product');

async function verifyDescriptions() {
  try {
    console.log('验证商品简介更新结果...\n');
    
    const products = await Product.findAll({
      where: { status: 1 },
      attributes: ['id', 'name', 'description', 'currentPrice'],
      order: [['id', 'ASC']]
    });
    
    console.log('='.repeat(80));
    
    products.forEach((p, index) => {
      console.log(`\n【商品 ${index + 1}】${p.name}`);
      console.log(`价格：¥${p.currentPrice}`);
      console.log(`简介长度：${p.description ? p.description.length : 0} 字符`);
      console.log('-'.repeat(80));
      
      if (p.description) {
        // 显示前 200 个字符作为预览
        const preview = p.description.substring(0, 200);
        console.log(`预览：${preview}...`);
      } else {
        console.log('预览：(无简介)');
      }
      
      console.log('='.repeat(80));
    });
    
    // 统计
    const totalLength = products.reduce((sum, p) => sum + (p.description ? p.description.length : 0), 0);
    const avgLength = totalLength / products.length;
    
    console.log(`\n📊 统计信息:`);
    console.log(`  商品总数：${products.length}`);
    console.log(`  简介总字符数：${totalLength}`);
    console.log(`  平均每个商品：${Math.round(avgLength)} 字符`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

verifyDescriptions();
