// 定时任务：每天凌晨 2 点解冻到期佣金
const cron = require('node-cron');
const { unlockCommissions } = require('./controllers/productController');

// 每天 2:00 执行
cron.schedule('0 2 * * *', async () => {
  console.log('⏰ 开始执行定时任务：解冻到期佣金');
  const count = await unlockCommissions();
  console.log(`✅ 定时任务完成，解冻了 ${count} 笔佣金`);
});

console.log('✅ 定时任务已启动：每天 2:00 解冻到期佣金');
