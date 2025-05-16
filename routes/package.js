const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 获取所有package数据
router.get('/', async (req, res, next) => {
  try {
    const [packages] = await db.query('SELECT * FROM t_package');
    res.json({
      code: 200,
      data: packages,
      message: '获取成功'
    });
  } catch (error) {
    next(error)
  }
});

module.exports = router; 