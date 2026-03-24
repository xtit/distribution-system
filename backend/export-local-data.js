/**
 * 导出本地 SQLite 数据为 JSON
 */
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOCAL_DB = path.join(__dirname, 'data/distribution.db');
const OUTPUT_FILE = path.join(__dirname, 'local-data-export.json');

console.log('📤 导出本地数据库...\n');

// 使用 sqlite3 命令行工具导出
const tables = ['Users', 'Products', 'Orders', 'OrderItems', 'Commissions', 'Referrals', 'Configs'];
const exportData = {};

function runQuery(query) {
  return new Promise((resolve, reject) => {
    exec(`sqlite3 -json "${LOCAL_DB}" "${query}"`, { encoding: 'utf8' }, (error, stdout, stderr) => {
      if (error) {
        if (stderr.includes('no such table')) {
          resolve([]); // 表不存在返回空数组
        } else {
          reject(new Error(stderr));
        }
      } else {
        try {
          const data = stdout.trim() ? JSON.parse(stdout) : [];
          resolve(data);
        } catch (e) {
          resolve([]);
        }
      }
    });
  });
}

async function main() {
  try {
    // 检查 sqlite3 是否可用
    await new Promise((resolve, reject) => {
      exec('which sqlite3', (error, stdout) => {
        if (error || !stdout.trim()) {
          reject(new Error('sqlite3 命令行工具未安装'));
        } else {
          resolve();
        }
      });
    });
    
    console.log('✅ sqlite3 工具可用\n');
    
    // 导出每个表
    for (const table of tables) {
      console.log(`📊 导出表：${table}...`);
      const data = await runQuery(`SELECT * FROM ${table}`);
      exportData[table] = data;
      console.log(`   ✅ ${data.length} 条记录\n`);
    }
    
    // 保存到文件
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(exportData, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ 导出完成：${OUTPUT_FILE}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ 导出失败:', error.message);
    console.error('请安装 sqlite3: sudo apt-get install sqlite3\n');
    process.exit(1);
  }
}

main();
