/**
 * 统一响应格式
 * @param {Object} options 响应选项
 * @param {boolean} options.success 是否成功
 * @param {any} options.data 响应数据
 * @param {number} options.errorCode 错误码
 * @param {string} options.errorMsg 错误信息
 * @param {boolean|null} options.allowRetry 是否允许重试
 * @param {string} options.requestId 请求ID
 * @returns {Object} 统一格式的响应对象
 */
const createResponse = ({
  success = true,
  data = null,
  errorCode = 0,
  errorMsg = "",
  allowRetry = null,
  requestId
}) => {
  return {
    IsSuccess: success,
    Data: data,
    Error_Code: errorCode,
    Error_Msg: errorMsg,
    AllowRetry: allowRetry,
    RequestId: requestId
  };
};

/**
 * 成功响应
 * @param {any} data 响应数据
 * @param {string} requestId 请求ID
 * @returns {Object} 成功响应对象
 */
const success = (data, requestId) => {
  return createResponse({
    success: true,
    data,
    requestId
  });
};

/**
 * 错误响应
 * @param {number} errorCode 错误码
 * @param {string} errorMsg 错误信息
 * @param {string} requestId 请求ID
 * @param {boolean|null} allowRetry 是否允许重试
 * @returns {Object} 错误响应对象
 */
const error = (errorCode, errorMsg, requestId, allowRetry = null) => {
  return createResponse({
    success: false,
    errorCode,
    errorMsg,
    requestId,
    allowRetry
  });
};

module.exports = {
  createResponse,
  success,
  error
}; 