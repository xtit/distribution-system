/**
 * 验证"徐杰的手表"佣金配置
 */

const { sequelize } = require('../config/database');
const Product = require('../models/Product');

async function verifyProductCommission() {
  try {
    console.log('查询"徐杰的手表"佣金配置...\n');
    
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
    console.log(`  商品价格：    ¥${product.currentPrice}`);
    console.log(`  佣金类型：    ${product.commissionType === 'fixed' ? '固定金额' : '按比例'}`);
    console.log(`  佣金值：      ${product.commissionValue}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (product.commissionType === 'fixed' && parseFloat(product.commissionValue) === 200) {
      console.log('\n✅ 验证通过：佣金已正确设置为固定金额 ¥200');
    } else {
      console.log('\n❌ 验证失败：佣金配置不正确');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

verifyProductCommission();
