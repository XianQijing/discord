const Redis = require('ioredis');
require('dotenv').config();
const logger = require('../config/logger');

const client = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB,
  retryStrategy: (times) => Math.min(times * 100, 5000) // 指数退避重试
})

client.on('error', (error) => {
  logger.error('redis error', {
    error: error.message,
    stack: error.stack
  });
});

module.exports = client