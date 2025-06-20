const mysql = require('mysql2');
require('dotenv').config();
const logger = require('../config/logger');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convert pool to use promises
const promisePool = pool.promise();

pool.on('connection', (conn) => {
  console.log(`New connection ID: ${conn.threadId}`);
});

pool.on('error', (error) => {
  logger.error('mysql Pool error', {
    error: error.message,
    stack: error.stack
  });
});

module.exports = promisePool; 