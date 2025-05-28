const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { AppError, errorHandler } = require('./middleware/errorHandler');
const response = require('./middleware/response');
const logger = require('./config/logger');

const app = express();

// 安全中间件
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 100, // 限制每个IP 1分钟内最多100个请求
  message: '请求过于频繁'
});

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