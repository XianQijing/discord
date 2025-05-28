const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');
const activeCodeDao = require('../dao/activeCodeDao');
const packageDao = require('../dao/packageDao');
const UserDao = require('../dao/userDao');
const userService = require('./userService');
const { formatBeijingTime } = require('../utils')

async function generateActiveCodes(packageId, count = 1) {
  try {
    // 获取套餐信息
    const [packageInfo] = await packageDao.getPackageById(packageId);
    if (!packageInfo) {
      throw new AppError('未找到指定的套餐', 404);
    }
    // 生成激活码
    const activeCodes = await activeCodeDao.createActiveCodes(
      packageId,
      count,
      packageInfo[0].description
    );

    return activeCodes
  } catch (error) {
    logger.error('Error generating active codes', {
      error: error.message,
      stack: error.stack,
      packageId,
      count
    });
    throw error;
  }
}

async function activateCode(activeCode) {
  try {
    // 验证激活码
    if (!activeCode) {
      throw new AppError('激活码不能为空', 400);
    }

    // 查找激活码
    const codeInfo = await activeCodeDao.findActiveCode(activeCode);
    if (!codeInfo) {
      throw new AppError('无效的激活码', 400);
    }

    if (codeInfo.user_id) {
      const [user] = await UserDao.findById(codeInfo.user_id)
      return {
        CardPwdArr: [{
          c: user.email,
          p: user.password,
          d: formatBeijingTime(user.plan_end),
          s: formatBeijingTime(user.plan_start)
        }]
      }
    }

    // 创建用户
    const userResult = await userService.createUser(codeInfo.package_id, true);

    // 更新激活码状态
    await activeCodeDao.updateActiveCodeStatus(activeCode, 1, userResult.id);

    return userResult.userResponse
  } catch (error) {
    logger.error('Error activating code', {
      error: error.message,
      stack: error.stack,
      activeCode
    });
    throw error;
  }
}

module.exports = {
  generateActiveCodes,
  activateCode
}; 