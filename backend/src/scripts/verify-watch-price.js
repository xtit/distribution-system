/**
 * 验证"徐杰的手表"售价和佣金
 */

const { sequelize } = require('../config/database');
const Product = require('../models/Product');

async function verifyProduct() {
  try {
    console.log('查询"徐杰的手表"详情...\n');
    
    const product = await Product.findOne({
      where: {
        name: {
          [require('sequelize').Op.like]: '%徐杰的手表%'
        }
      }
    });
    
    if (!product) {
      console.error('❌ 未找到商品');
      process.exit(1);
    }
    
    console.log('商品详情:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  商品 ID:      ${product.id}`);
    console.log(`  商品名称：    ${product.name}`);
    console.log(`  原价：        ¥${product.originalPrice}`);
    console.log(`  现价：        ¥${product.currentPrice}`);
    console.log(`  成本价：      ¥${product.costPrice}`);
    console.log(`  库存：        ${product.stock}`);
    console.log(`  已售：        ${product.soldCount}`);
    console.log(`  佣金类型：    ${product.commissionType === 'fixed' ? '固定金额' : '按比例'}`);
    console.log(`  佣金值：      ¥${product.commissionValue}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 计算佣金比例
    const commissionRate = (parseFloat(product.commissionValue) / parseFloat(product.currentPrice) * 100).toFixed(2);
    console.log(`\n💰 佣金比例：约 ${commissionRate}% (¥${product.commissionValue} / ¥${product.currentPrice})`);
    
    if (parseFloat(product.currentPrice) === 999 && parseFloat(product.commissionValue) === 200) {
      console.log('\n✅ 验证通过：售价 ¥999，固定佣金 ¥200');
    } else {
      console.log('\n❌ 验证失败');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

verifyProduct();
