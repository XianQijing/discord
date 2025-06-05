const db = require('../config/database');
const logger = require('../config/logger');

class UserDao {
  async findByNickname(nickname) {
    const [users] = await db.query(
      'SELECT * FROM t_client_user WHERE nickname = ?',
      [nickname]
    );
    return users;
  }

  async findById(id) {
    const [users] = await db.query(
      'SELECT * FROM t_client_user WHERE id = ?',
      [id]
    );
    return users;
  }

  async createUserWithTransaction(userData, channelId, settings) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. 创建用户
      const insertFields = Object.keys(userData);
      const placeholders = insertFields.map(() => '?').join(',');
      const values = Object.values(userData);

      await connection.query(
        `INSERT INTO t_client_user (${insertFields.join(',')}, create_time, update_time, create_at) 
         VALUES (${placeholders}, NOW(), NOW(), 1)`,
        values
      );

      // 2. 创建默认频道
      await connection.query(
        `INSERT INTO t_user_channel (id, create_time, update_time, title, server_id, user_id)
        VALUES (?, NOW(), NOW(), ?, ?, ?)`,
        [channelId, '常用频道', 'midjourney', userData.id]
      );


      // 3. 创建用户设置
      const settingFields = [
        'create_time',
        'update_time',
        'raw_mode',
        'stylize',
        'variation_mode',
        ...Object.keys(settings[0])
      ].join(',');

      const settingPlaceholders = `(NOW(), NOW(), 0, '', '', ${Object.keys(settings[0]).map(() => '?').join(',')})`;

      await connection.query(
        `INSERT INTO t_user_setting (${settingFields})
         VALUES 
         ${settingPlaceholders},
         ${settingPlaceholders}`,
        [
          ...Object.values(settings[0]),
          ...Object.values(settings[1])
        ]
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      logger.error('Error in user creation transaction', {
        error: error.message,
        stack: error.stack,
        userId: userData.id
      });
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new UserDao(); 