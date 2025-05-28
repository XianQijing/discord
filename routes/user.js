const express = require('express');
const router = express.Router();
const { createUser } = require('../services/userService');
const { AppError } = require('../middleware/errorHandler');

// 新增用户
router.post('/', async (req, res, next) => {
  try {
    const { id } = req.body;

    if (!id) {
      throw new AppError('请提供id', 400);
    }
    if (!/^[a-zA-Z0-9]+$/.test(id)) {
      throw new AppError('Id只能包含字母、数字', 400);
    }

    const data = await createUser(id);

    res.json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router; 