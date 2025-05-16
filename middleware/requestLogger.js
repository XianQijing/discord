const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
  // 创建带RequestId的日志记录器
  
  // 记录请求开始时间
  const start = Date.now();

  // 记录请求开始
  logger.info('Request started', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // 请求完成后记录日志
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
};

module.exports = requestLogger; 