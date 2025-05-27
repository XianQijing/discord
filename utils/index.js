
// 转换为北京时间
const formatBeijingTime = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 常量定义
const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
// 生成随机6位大写字母
function generateRandomNickname() {
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += LETTERS.charAt(Math.floor(Math.random() * LETTERS.length));
  }
  return result.toUpperCase();
}

// 生成6-12位随机小写字母密码
function generateRandomPassword() {
  const length = Math.floor(Math.random() * (12 - 6 + 1)) + 6;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += LETTERS.charAt(Math.floor(Math.random() * LETTERS.length));
  }
  return result;
}

module.exports = {
  formatBeijingTime,
  generateRandomNickname,
  generateRandomPassword
}