const requestIdMiddleware = (req, res, next) => {
  // 生成请求ID，格式：年月日时分秒毫秒
  const now = new Date();
  const requestId = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0') +
    String(now.getMilliseconds()).padStart(3, '0');
  
  req.requestId = requestId;
  next();
};

module.exports = requestIdMiddleware; 