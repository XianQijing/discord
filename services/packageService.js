const packageDao = require('../dao/packageDao');

class PackageService {
  async getById(id) {
    return packageDao.getPackageById(id);
  }
  async getList(id) {
    if (id) {
      return this.getById(id)
    }
    return packageDao.getList();
  }
}

module.exports = new PackageService()