/**
 * Eato - 我的页面
 */
const app = getApp();

Page({
  data: {
    statusBarHeight: 20,
    userInfo: {
      nickname: '美食家小王',
      avatar: ''
    },
    stats: {
      members: 3,
      favorites: 12,
      records: 28
    }
  },

  onLoad() {
    // 获取状态栏高度
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20
    });
    this.loadUserInfo();
  },

  onShow() {
    // 设置 TabBar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(2);
    }
    
    // 刷新统计数据
    this.loadStats();
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
    }
  },

  // 加载统计数据
  loadStats() {
    // TODO: 从后端获取统计数据
  },

  // 编辑个人资料
  editProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const userInfo = res.userInfo;
        this.setData({ userInfo });
        wx.setStorageSync('userInfo', userInfo);
      },
      fail: () => {
        wx.showToast({
          title: '获取信息失败',
          icon: 'none'
        });
      }
    });
  },

  // 跳转到吃货档案
  goToMembers() {
    wx.navigateTo({
      url: '/pages/members/members'
    });
  },

  // 跳转到用餐记录
  goToHistory() {
    wx.navigateTo({
      url: '/pages/history/history'
    });
  },

  // 跳转到收藏
  goToFavorites() {
    wx.navigateTo({
      url: '/pages/favorites/favorites'
    });
  },

  // 跳转到黑名单
  goToBlacklist() {
    wx.navigateTo({
      url: '/pages/blacklist/blacklist'
    });
  },

  // 跳转到设置
  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  }
});

