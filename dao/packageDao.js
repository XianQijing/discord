const db = require('../config/database');

class PackageDao {
  async getPackageById(id) {
    return db.query(
      'SELECT * FROM t_package WHERE id = ?',
      [id]
    );
  }
  async getList() {
    return await db.query('SELECT id, title, days, status, description FROM t_package');
  }
}

module.exports = new PackageDao();