const express = require('express');
const router = express.Router();
const PackageService = require('../services/packageService')

// 获取所有package数据
router.get('/', async (req, res, next) => {
  const { id } = req.query;
  try {
    const [list] = await PackageService.getList(id)

    res.json(list);
  } catch (error) {
    next(error);
  }
});

module.exports = router; 