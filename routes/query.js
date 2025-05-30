const express = require('express');
const router = express.Router();
const PackageService = require('../services/packageService')
const { AppError } = require('../middleware/errorHandler');

// 获取所有package数据
router.get('/', async (req, res, next) => {
  const { id } = req.query;
  try {
    if (id && !/^[a-zA-Z0-9]+$/.test(id)) {
      throw new AppError('Id只能包含字母、数字', 400);
    }
    const [list] = await PackageService.getList(id)

    res.json(list);
  } catch (error) {
    next(error);
  }
});

module.exports = router; 