const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);
const logger = require('../config/logger');

// 配置
const LOG_DIR = path.join(__dirname, '../logs');
const RETENTION_DAYS = 7; // 保留天数
const MAX_LOG_SIZE = 20 * 1024 * 1024; // 20MB

// 获取文件年龄（天数）
async function getFileAge(filePath) {
  const stats = await stat(filePath);
  const fileAge = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
  return fileAge;
}

// 获取文件大小（MB）
async function getFileSize(filePath) {
  const stats = await stat(filePath);
  return stats.size / (1024 * 1024);
}

// 清理日志文件
async function cleanLogs() {
  try {
    logger.info('开始清理日志文件...');
    
    const files = await readdir(LOG_DIR);
    let deletedCount = 0;
    let totalSize = 0;

    for (const file of files) {
      const filePath = path.join(LOG_DIR, file);
      
      // 跳过目录和当前日志文件
      if (file === 'current' || file === 'audit.json') continue;
      
      try {
        const stats = await stat(filePath);
        if (stats.isDirectory()) continue;

        const fileAge = await getFileAge(filePath);
        const fileSize = await getFileSize(filePath);

        // 删除超过保留天数的文件
        if (fileAge > RETENTION_DAYS) {
          await unlink(filePath);
          deletedCount++;
          totalSize += fileSize;
          logger.info(`已删除过期日志文件: ${file} (${fileAge.toFixed(1)}天)`);
        }
        // 删除超过大小限制的文件
        else if (fileSize > MAX_LOG_SIZE) {
          await unlink(filePath);
          deletedCount++;
          totalSize += fileSize;
          logger.info(`已删除超大日志文件: ${file} (${fileSize.toFixed(2)}MB)`);
        }
      } catch (error) {
        logger.error(`处理文件 ${file} 时出错:`, error);
      }
    }

    logger.info(`日志清理完成。共删除 ${deletedCount} 个文件，释放 ${totalSize.toFixed(2)}MB 空间`);
  } catch (error) {
    logger.error('清理日志文件时出错:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  cleanLogs().then(() => {
    process.exit(0);
  }).catch(error => {
    logger.error('脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = cleanLogs; 