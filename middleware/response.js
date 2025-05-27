const { success } = require('../utils/response');
const logger = require('../config/logger');

const forbiddenPatterns = [
  /select.*from/i,
  /union.*select/i,
  /insert.*into/i,
  /delete.*from/i,
  /drop.*table/i
];


function createID(now) {
  // 生成请求ID，格式：年月日时分秒毫秒
  return now.getFullYear().toString() +
  String(now.getMonth() + 1).padStart(2, '0') +
  String(now.getDate()).padStart(2, '0') +
  String(now.getHours()).padStart(2, '0') +
  String(now.getMinutes()).padStart(2, '0') +
  String(now.getSeconds()).padStart(2, '0') +
  String(now.getMilliseconds()).padStart(3, '0');
}

const requestIdMiddleware = (req, res, next) => {
  const now = new Date();
  const requestId = createID(now)
  req.requestId = requestId;

  const originalJson = res.json;
  res.json = function(data) {
    if (!data.Error_Code) {
      data = success(data, requestId); // 合并到响应体
    }
    logger.info('Request data', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      requestId,
      ip: req.ip,
      data
    });
    return originalJson.call(this, data);
  }

  const payload = JSON.stringify({
    ...req.query,
    ...req.body,
    ...req.params
  })

  if (forbiddenPatterns.some(pattern => pattern.test(payload))) {
    return res.status(403).send('检测到非法请求');
  }

  res.on('finish', () => {
    const duration = Date.now() - now;
    logger.info('Request completed', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      requestId,
      ip: req.ip,
      duration: `${duration}ms`
    });
  });

  next();
};

module.exports = requestIdMiddleware; 