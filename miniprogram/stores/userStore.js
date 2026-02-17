/**
 * 用户状态管理
 */

// 生成临时用户ID（实际项目应该用微信登录的 openid）
const _generateUserId = () => {
  // 开发阶段固定 userId，方便测试
  const DEV_USER_ID = 'dev_user_001';

  // 强制使用开发 ID（清除旧缓存）
  wx.setStorageSync('userId', DEV_USER_ID);
  return DEV_USER_ID;

  // 生产模式代码（注释掉）
  // let userId = wx.getStorageSync('userId');
  // if (!userId) {
  //   userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  //   wx.setStorageSync('userId', userId);
  // }
  // return userId;
};

// 状态
let _state = {
  userId: _generateUserId(),
  userInfo: null,
  isLoggedIn: false
};

// 监听者列表
let _listeners = [];

const _notify = () => {
  _listeners.forEach(listener => listener({ ..._state }));
};

const subscribe = (listener) => {
  _listeners.push(listener);
  listener({ ..._state });
  return () => {
    _listeners = _listeners.filter(l => l !== listener);
  };
};

const getState = () => ({ ..._state });

const getUserId = () => _state.userId;

const setUserInfo = (userInfo) => {
  _state.userInfo = userInfo;
  _state.isLoggedIn = true;
  wx.setStorageSync('userInfo', userInfo);
  _notify();
};

module.exports = {
  subscribe,
  getState,
  getUserId,
  setUserInfo
};

