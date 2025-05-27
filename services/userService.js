const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');
const crypto = require('crypto');
const PackageService = require('./packageService.js');
const userDao = require('../dao/userDao');
const { generateRandomNickname, generateRandomPassword, formatBeijingTime } = require('../utils')

class Setting {
  constructor() {
    this.midSetting = {
      bot_type: 'MID_JOURNEY',
      mode: 'fast',
      version: '--v 6.1',
      server_id: 'midjourney'
    }
    this.nijiSetting = {
      bot_type: 'NIJI_JOURNEY',
      mode: 'fast',
      version: '--niji 6',
      server_id: 'midjourney'
    }
  }
  getSetting(userId) {
    return [{ ...this.midSetting, id: crypto.randomUUID().replace(/-/g, ''), suffix: `${this.midSetting.version} --${this.midSetting.mode}`, user_id: userId }, { ...this.nijiSetting, id: crypto.randomUUID().replace(/-/g, ''), suffix: `${this.nijiSetting.version} --${this.nijiSetting.mode}`, user_id: userId }]
  }
}

class User {
  constructor({
    days,
    fast_total,
    relax_total,
    relax_current,
    id,
    status,
    pkg_type,
    relax_interval
  }) {
    this.userData = {
      fast_total,
      relax_total,
      relax_current,
      pkg_id: id,
      status,
      pkg_type,
      relax_interval
    }
    this.days = days
  }
  async create() {
    const nickname = await createNickname();
    const plan_start = Date.now();
    return {
      ...this.userData,
      password: generateRandomPassword(),
      id: crypto.randomUUID().replace(/-/g, ''),
      email: `${nickname}-${this.days}-${this.userData.fast_total}${this.userData.relax_total}${this.userData.relax_current}`,
      plan_end: plan_start + (this.days * 24 * 60 * 60 * 1000),
      plan_start,
      nickname
    }
  }
}



async function findUser(nickname) {
  return await userDao.findByNickname(nickname);
}

async function createNickname() {
  let nickname = generateRandomNickname();
  const existingUsers = await findUser(nickname);

  if (existingUsers.length) {
    nickname = await createNickname();
  }
  return nickname;
}

async function getPackageById(packageId) {
  const [packages] = await PackageService.getById(packageId)
  if (packages.length === 0) {
    throw new AppError('未找到指定的数据', 400);
  }

  return packages[0];
}

async function createUser(packageId) {
  try {
    // 获取package数据
    const packageData = await getPackageById(packageId);

    const user = new User(packageData)
    const userData = await user.create()


    const [midSetting, nijiSetting] = new Setting().getSetting(userData.id);

    // 使用事务创建用户及其相关数据
    await userDao.createUserWithTransaction(userData, channelId = crypto.randomUUID().replace(/-/g, ''), [midSetting, nijiSetting]);

    return {
      CardPwdArr: [{
        c: userData.email,
        p: userData.password,
        d: formatBeijingTime(userData.plan_end),
        s: formatBeijingTime(userData.plan_start)
      }]
    };
  } catch (error) {
    logger.error('Error creating user', {
      error: error.message,
      stack: error.stack,
      packageId
    });
    throw error;
  }
}

module.exports = {
  createUser,
  findUser,
  getPackageById
}; 