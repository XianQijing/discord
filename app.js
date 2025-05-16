const express = require('express');
const cors = require('cors');
// const rateLimit = require('express-rate-limit');
const { AppError, errorHandler } = require('./middleware/errorHandler');

const app = express();

// 安全中间件
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15分钟
//   max: 100 // 限制每个IP 15分钟内最多100个请求
// });

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(limiter);

// Routes
const packageRouter = require('./routes/package');
const userRouter = require('./routes/user');
app.use('/packages', packageRouter);
app.use('/users', userRouter);

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
  console.log(`Server is running on port ${PORT}`);
});