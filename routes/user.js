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

    const user = await createUser(id);

    res.json({
      code: 200,
      data: user,
      message: '用户创建成功'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 