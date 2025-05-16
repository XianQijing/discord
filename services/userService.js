const db = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

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
  const length = Math.floor(Math.random() * (12 - 6 + 1)) + 6;
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
  );
  return existingUsers;
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
  const [packages] = await db.query(
    'SELECT * FROM t_package WHERE id = ?',
    [packageId]
  );
  
  if (packages.length === 0) {
    throw new AppError('未找到指定的数据', 400);
  }
  
  return packages[0];
}

async function createUser(packageId) {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // 获取package数据
    const packageData = await getPackageById(packageId);
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
    
    // 生成用户数据
    const nickname = await createNickname();
    const password = generateRandomPassword();
    
    const email = `${nickname}-${days}-${fast_total}${relax_total}${relax_current}`;
    const plan_start = Date.now();
    const plan_end = plan_start + (days * 24 * 60 * 60 * 1000);

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

    // 插入用户数据
    const insertFields = Object.keys(userData);
    const placeholders = insertFields.map(() => '?').join(',');
    const values = Object.values(userData);

    await connection.query(
      `INSERT INTO t_client_user (${insertFields.join(',')}, id, create_time, update_time) 
       VALUES (${placeholders}, REPLACE(UUID(), '-', ''), NOW(), NOW())`,
      values
    );


    return {
      email,
      password: password
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  createUser,
  findUser,
  getPackageById
}; 