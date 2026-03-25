/**
 * 修改"徐杰的手表"佣金为固定金额 200 元
 * 运行时间：2026-03-25
 */

const { sequelize } = require('../config/database');
const Product = require('../models/Product');

async function updateProductCommission() {
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
      
      // 列出所有商品
      const allProducts = await Product.findAll({
        attributes: ['id', 'name', 'price', 'commissionType', 'commissionRate', 'commissionAmount']
      });
      
      console.log('\n所有商品列表:');
      allProducts.forEach(p => {
        console.log(`- ${p.name} (ID: ${p.id})`);
      });
      
      process.exit(1);
    }
    
    console.log('✅ 找到商品:');
    console.log(`  ID: ${product.id}`);
    console.log(`  名称：${product.name}`);
    console.log(`  价格：${product.currentPrice}`);
    console.log(`  当前佣金类型：${product.commissionType}`);
    console.log(`  当前佣金值：${product.commissionValue}`);
    
    // 修改为固定佣金 200 元
    console.log('\n正在修改佣金配置...');
    
    await product.update({
      commissionType: 'fixed',      // 固定佣金
      commissionValue: 200.00       // 固定金额 200 元
    });
    
    console.log('✅ 修改成功!');
    console.log(`  新佣金类型：fixed`);
    console.log(`  新佣金值：¥200.00`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

updateProductCommission();
