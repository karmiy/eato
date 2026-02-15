/**
 * Eato - 小程序入口文件
 */
App({
  globalData: {
    userInfo: null,
    location: null,
    systemInfo: null,
    statusBarHeight: 0,
    navBarHeight: 44,
    tabBarHeight: 100
  },

  onLaunch() {
    // 获取系统信息
    this.initSystemInfo();
    // 检查登录状态
    this.checkLogin();
  },

  // 初始化系统信息
  initSystemInfo() {
    try {
      // 使用新的 API 替代废弃的 wx.getSystemInfoSync
      const windowInfo = wx.getWindowInfo();
      const deviceInfo = wx.getDeviceInfo();
      const appBaseInfo = wx.getAppBaseInfo();
      const menuButton = wx.getMenuButtonBoundingClientRect();

      this.globalData.systemInfo = {
        ...windowInfo,
        ...deviceInfo,
        ...appBaseInfo
      };
      this.globalData.statusBarHeight = windowInfo.statusBarHeight || 20;
      this.globalData.navBarHeight = (menuButton.top - windowInfo.statusBarHeight) * 2 + menuButton.height;

    } catch (e) {
      console.error('获取系统信息失败', e);
      // 使用默认值
      this.globalData.statusBarHeight = 20;
      this.globalData.navBarHeight = 44;
    }
  },

  // 检查登录状态
  checkLogin() {
    wx.checkSession({
      success: () => {
        // session 有效，获取存储的用户信息
        const userInfo = wx.getStorageSync('userInfo');
        if (userInfo) {
          this.globalData.userInfo = userInfo;
        }
      },
      fail: () => {
        // session 过期，需要重新登录
        this.login();
      }
    });
  },

  // 登录
  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            // TODO: 发送 code 到后端获取 openid
            resolve(res.code);
          } else {
            reject(new Error('登录失败'));
          }
        },
        fail: reject
      });
    });
  },

  // 获取位置
  getLocation() {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          this.globalData.location = {
            latitude: res.latitude,
            longitude: res.longitude
          };
          resolve(res);
        },
        fail: (err) => {
          // 使用默认位置（北京中关村）
          this.globalData.location = {
            latitude: 39.9847,
            longitude: 116.3046
          };
          reject(err);
        }
      });
    });
  }
});

