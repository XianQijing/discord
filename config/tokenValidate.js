const redis = require('../config/redis')
const logger = require('../config/logger');

module.exports = async (req) => {
  const tokenStr= req?.headers?.authorization?.replace(/Bearer /, '')
  if (!tokenStr) return true

  try {
    const reply = await redis.get(tokenStr)
    return reply
  }catch(error) {
    logger.error('token error', error);
  }
  return false
}