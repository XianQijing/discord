const express = require('express');
const router = express.Router();
const activeCodeService = require('../services/activeCodeService');
const { AppError } = require('../middleware/errorHandler');

// 生成激活码
router.post('/create', async (req, res, next) => {
  try {
    const { packageId, count = 1 } = req.body;

    // 验证packageId
    if (!packageId) {
      throw new AppError('packageId不能为空', 400);
    }
    if (!/^[a-zA-Z0-9]+$/.test(packageId)) {
      throw new AppError('packageId只能包含字母、数字', 400);
    }

    // 验证count
    if (count === undefined || count === null) {
      count = 1
    }
    if (typeof count !== 'number' || !Number.isInteger(count)) {
      throw new AppError('count必须是整数', 400);
    }
    if (count < 1 || count > 1000) {
      throw new AppError('count必须在1-1000之间', 400);
    }

    const result = await activeCodeService.generateActiveCodes(packageId, count);
    res.json(`插入${result.length}条成功` +( result.length !== count ? `,失败${count-result.length}条。` : '。'));
  } catch (error) {
    next(error);
  }
});

// 激活用户
router.post('/active', async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      throw new AppError('激活码不能为空', 400);
    }
    if (!/^[a-zA-Z0-9]+$/.test(code) || code.length != 8) {
      throw new AppError('激活码只能包含8位字母、数字', 400);
    }

    const result = await activeCodeService.activateCode(code);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router; 