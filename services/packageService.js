const packageDao = require('../dao/packageDao');

class PackageService {
  async getById(id) {
    return packageDao.getPackageById(id);
  }
  async getList() {
    return packageDao.getList();
  }
}

module.exports = new PackageService()