require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { AppError, errorHandler } = require('./middleware/errorHandler');
const response = require('./middleware/response');
const logger = require('./config/logger');
const cleanLogs = require('./scripts/cleanLogs');
const expressJWT = require('express-jwt'); 
const tokenValidate = require('./config/tokenValidate')

// 启动时清理日志
cleanLogs().catch(error => {
  logger.error('启动时清理日志失败:', error);
});

const app = express();

// 安全中间件
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 100, // 限制每个IP 1分钟内最多100个请求
  message: '请求过于频繁'
});

app.use(
  expressJWT.expressjwt({
    secret: process.env.SECRET_KEY, // 使用你的秘钥
    algorithms: ['HS256'],
    isRevoked: tokenValidate,
  }).unless({ path: ['/query', '/users', '/code/active']})
);

// 中间件
app.use(cors());
app.use(express.json());
app.use(limiter);
app.use(response);

// Routes
const packageRouter = require('./routes/query');
const userRouter = require('./routes/user');
const activeCodeRouter = require('./routes/activeCode');
app.use('/query', packageRouter);
app.use('/users', userRouter);
app.use('/code', activeCodeRouter);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Ru-Lin Backend API' });
});

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});