const express = require('express');
const router = express.Router();
const db = require('../config/database');
const logger = require('../config/logger');
const { success } = require('../utils/response');

// 获取所有package数据
router.get('/', async (req, res, next) => {
  try {
    const [list] = await db.query('SELECT id, title, days, status, description FROM t_package');
    
    logger.info('Package list retrieved', {
      requestId: req.requestId,
      count: list.length
    });

    res.json(success(list, req.requestId));
  } catch (error) {
    next(error);
  }
});

module.exports = router; 