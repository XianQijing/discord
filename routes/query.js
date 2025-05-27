const express = require('express');
const router = express.Router();
const PackageService = require('../services/packageService')

// 获取所有package数据
router.get('/', async (req, res, next) => {
  try {
    const [list] = await PackageService.getList()

    res.json(list);
  } catch (error) {
    next(error);
  }
});

module.exports = router; 