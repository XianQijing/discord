const winston = require('winston');
const path = require('path');
require('winston-daily-rotate-file');

// 自定义日志格式
const customFormat = winston.format.printf(({ level, message, timestamp, requestId, ...metadata }) => {
  let msg = `${timestamp} [${level}] `;
  if (requestId) {
    msg += `[${requestId}] `;
  }
  msg += message;
  
  // 添加其他元数据
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  return msg;
});

// 定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  customFormat
);

// 创建日志目录
const logDir = 'logs';

// 创建日志传输器
const createRotateTransport = (filename, level = 'info') => {
  return new winston.transports.DailyRotateFile({
    filename: path.join(logDir, filename),
    datePattern: 'YYYY-MM-DD',
    level,
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true, // 压缩旧日志文件
    format: logFormat,
    handleExceptions: true,
    handleRejections: true,
    json: false,
    createSymlink: true, // 创建当前日志文件的符号链接
    symlinkName: filename.replace('-%DATE%', '-current'),
    auditFile: path.join(logDir, 'audit.json'), // 审计文件
    options: { flags: 'a' } // 追加模式
  });
};

const transports = [
  // 控制台输出
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }),
  // 错误日志文件
  createRotateTransport('error-%DATE%.log', 'error'),
  // 所有日志文件
  createRotateTransport('combined-%DATE%.log', 'info')
];

// 创建logger实例
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports,
  // 处理未捕获的异常
  exceptionHandlers: [
    createRotateTransport('exceptions-%DATE%.log', 'error')
  ],
  // 处理未处理的Promise拒绝
  rejectionHandlers: [
    createRotateTransport('rejections-%DATE%.log', 'error')
  ],
  // 退出时处理未完成的日志写入
  exitOnError: false
});

// 添加流接口，用于 Morgan 等中间件
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Closing logger...');
  logger.end(() => {
    process.exit(0);
  });
});

module.exports = logger;