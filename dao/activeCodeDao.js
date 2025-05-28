const db = require('../config/database');
const logger = require('../config/logger');
const crypto = require('crypto');

class ActiveCodeDao {
  async isActiveCodeExists(activeCode) {
    const [codes] = await db.query(
      'SELECT COUNT(*) as count FROM activecode WHERE active_code = ?',
      [activeCode]
    );
    return codes[0].count > 0;
  }

  async createActiveCodes(packageId, count, description) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 生成激活码
      const activeCodes = [];
      let attempts = 0;
      const maxAttempts = count * 3; // 最多尝试3倍次数

      while (activeCodes.length < count && attempts < maxAttempts) {
        const activeCode = this.generateActiveCode();
        const exists = await this.isActiveCodeExists(activeCode);
        
        if (!exists && !activeCodes.includes(activeCode)) {
          activeCodes.push(activeCode);
        }
        attempts++;
      }

      // 批量插入激活码
      const values = activeCodes.map(code => [
        crypto.randomUUID().replace(/-/g, ''),
        null,
        code,
        description,
        packageId,
        0,
        new Date()
      ]);
      await connection.query(
        `INSERT INTO activecode 
         (id, user_id, active_code, description, package_id, status, create_time) 
         VALUES ?`,
        [values]
      );

      await connection.commit();
      return activeCodes;
    } catch (error) {
      await connection.rollback();
      logger.error('Error creating active codes', {
        error: error.message,
        stack: error.stack,
        packageId,
        count
      });
      throw error;
    } finally {
      connection.release();
    }
  }

  // 生成8位激活码
  generateActiveCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segmentLength = 8;
    let segment = '';
    for (let i = 0; i < segmentLength; i++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return segment;
  }

  async findActiveCode(activeCode) {
    const [codes] = await db.query(
      'SELECT * FROM activecode WHERE active_code = ?',
      [activeCode]
    );
    return codes[0];
  }

  async updateActiveCodeStatus(activeCode, status, userId) {
    const [result] = await db.query(
      'UPDATE activecode SET status = ?, user_id = ?, active_time = ? WHERE active_code = ?',
      [status, userId, new Date(), activeCode]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new ActiveCodeDao(); 