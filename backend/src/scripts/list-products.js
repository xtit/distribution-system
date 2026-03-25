/**
 * 查看所有在售商品
 */

const { sequelize } = require('../config/database');
const Product = require('../models/Product');

async function listProducts() {
  try {
    console.log('查询所有在售商品...\n');
    
    const products = await Product.findAll({
      where: { status: 1 },
      attributes: ['id', 'name', 'description', 'currentPrice', 'originalPrice', 'stock', 'soldCount'],
      order: [['id', 'ASC']]
    });
    
    if (products.length === 0) {
      console.log('❌ 没有找到在售商品');
      process.exit(1);
    }
    
    console.log(`找到 ${products.length} 个在售商品:\n`);
    console.log('='.repeat(80));
    
    products.forEach((p, index) => {
      console.log(`\n【商品 ${index + 1}】`);
      console.log(`  ID:     ${p.id}`);
      console.log(`  名称：   ${p.name}`);
      console.log(`  价格：   ¥${p.currentPrice} (原价：¥${p.originalPrice})`);
      console.log(`  库存：   ${p.stock}`);
      console.log(`  已售：   ${p.soldCount}`);
      console.log(`  简介：   ${p.description ? p.description.substring(0, 100) + '...' : '(空)'}`);
      console.log('='.repeat(80));
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

listProducts();
