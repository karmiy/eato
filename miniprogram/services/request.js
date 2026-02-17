/**
 * 网络请求封装
 */
const { baseUrl } = require('./config');

/**
 * 发起请求
 * @param {Object} options 请求配置
 */
const request = (options) => {
  return new Promise((resolve, reject) => {
    const { url, method = 'GET', data, showLoading = true } = options;

    if (showLoading) {
      wx.showLoading({ title: '加载中...', mask: true });
    }

    wx.request({
      url: `${baseUrl}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          const error = new Error(res.data?.detail || '请求失败');
          error.statusCode = res.statusCode;
          reject(error);
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '网络错误'));
      },
      complete: () => {
        if (showLoading) {
          wx.hideLoading();
        }
      }
    });
  });
};

// 便捷方法
const get = (url, data, options = {}) => request({ url, method: 'GET', data, ...options });
const post = (url, data, options = {}) => request({ url, method: 'POST', data, ...options });
const put = (url, data, options = {}) => request({ url, method: 'PUT', data, ...options });
const del = (url, data, options = {}) => request({ url, method: 'DELETE', data, ...options });

module.exports = {
  request,
  get,
  post,
  put,
  del
};

