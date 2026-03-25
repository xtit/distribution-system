/**
 * 修改"徐杰的手表"售价为 999 元
 * 运行时间：2026-03-25
 */

const { sequelize } = require('../config/database');
const Product = require('../models/Product');

async function updateProductPrice() {
  try {
    console.log('开始查询商品...');
    
    // 查找"徐杰的手表"
    const product = await Product.findOne({
      where: {
        name: {
          [require('sequelize').Op.like]: '%徐杰的手表%'
        }
      }
    });
    
    if (!product) {
      console.error('❌ 未找到"徐杰的手表"商品');
      process.exit(1);
    }
    
    console.log('✅ 找到商品:');
    console.log(`  ID: ${product.id}`);
    console.log(`  名称：${product.name}`);
    console.log(`  当前售价：¥${product.currentPrice}`);
    console.log(`  原价：¥${product.originalPrice}`);
    
    // 修改售价为 999 元
    console.log('\n正在修改售价...');
    
    await product.update({
      currentPrice: 999.00,
      originalPrice: 999.00  // 同时更新原价
    });
    
    console.log('✅ 修改成功!');
    console.log(`  新售价：¥999.00`);
    console.log(`  新原价：¥999.00`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

updateProductPrice();
