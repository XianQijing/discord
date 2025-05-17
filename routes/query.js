const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 获取所有package数据
router.get('/', async (req, res, next) => {
  try {
    const [list] = await db.query('SELECT id, title, days, status, description FROM t_package');

    res.json(list);
  } catch (error) {
    next(error);
  }
});

module.exports = router; 