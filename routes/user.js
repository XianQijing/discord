const express = require('express');
const { AppError } = require('../middleware/errorHandler');
const router = express.Router();
const db = require('../config/database');

// 生成随机9位大写字母
function generateRandomNickname() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return result;
}

// 生成6-12位随机小写字母密码
function generateRandomPassword() {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const length = Math.floor(Math.random() * (12 - 6 + 1)) + 6; // 生成6-12之间的随机数
  let result = '';
  for (let i = 0; i < length; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return result;
}

async function findUser(nickname) {
  const [existingUsers] = await db.query(
    'SELECT * FROM t_client_user WHERE nickname = ?',
    [nickname]
  )
  return existingUsers
}

async function creatNickname() {
  let nickname = generateRandomNickname()
  const existingUsers = await findUser(nickname)

  if (existingUsers.length) {
    console.log('重复了', existingUsers[0])
    nickname = creatNickname()
  }
  return nickname
}

// 新增用户
router.post('/', async (req, res, next) => {
  try {
    const { id } = req.body; // 从请求体中获取id

    if (!id) {
      throw new AppError('请提供id', 400)
    }

    // 根据id获取特定的package数据
    const [packages] = await db.query(
      'SELECT * FROM t_package WHERE id = ?',
      [id]
    );
    
    if (packages.length === 0) {
      throw new AppError('未找到指定的package数据', 400)
    }

    // 从package数据中提取用户信息
    const packageData = packages[0];
    const { 
      days, 
      fast_total, 
      relax_total, 
      relax_current, 
      id: pkg_id, 
      status, 
      pkg_type, 
      relax_interval 
    } = packageData;
    
    // 生成随机昵称和密码
    const nickname = await creatNickname();
    const password = generateRandomPassword();
    
    // 生成邮箱
    const email = `${nickname}-${days}-${fast_total}${relax_total}${relax_current}`;
    
    // 计算时间戳
    const plan_start = Date.now(); // 当前时间戳（毫秒）
    const plan_end = plan_start + (days * 24 * 60 * 60 * 1000); // 当前时间戳 + days天（毫秒）

    // 准备插入数据
    const userData = {
      pkg_type,
      relax_interval,
      relax_current,
      status,
      pkg_id,
      fast_total,
      relax_total,
      nickname,
      password,
      email,
      create_at: 2,
      plan_start,
      plan_end
    };

    // 构建SQL插入语句
    const insertFields = Object.keys(userData);
    const placeholders = insertFields.map(() => '?').join(',');
    const values = Object.values(userData);

    // 插入新用户
    await db.query(
      `INSERT INTO t_client_user (${insertFields.join(',')}, id, create_time, update_time) 
       VALUES (${placeholders}, REPLACE(UUID(), '-', ''), NOW(), NOW())`,
      values
    );

    res.json({
      code: 200,
      data: {
        nickname,
        password,
        email
      },
      message: '用户创建成功'
    });
  } catch (error) {
    next(error)
  }
});

module.exports = router; 