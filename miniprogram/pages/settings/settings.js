/**
 * Eato - 设置页面
 */
Page({
  data: {
    searchRadius: 3,
    shakeEnabled: true,
    notificationEnabled: false,
    cacheSize: '12.5MB'
  },

  onLoad() {
    this.loadSettings();
  },

  loadSettings() {
    const settings = wx.getStorageSync('settings') || {};
    this.setData({
      searchRadius: settings.searchRadius || 3,
      shakeEnabled: settings.shakeEnabled !== false,
      notificationEnabled: settings.notificationEnabled || false
    });
  },

  saveSettings() {
    wx.setStorageSync('settings', {
      searchRadius: this.data.searchRadius,
      shakeEnabled: this.data.shakeEnabled,
      notificationEnabled: this.data.notificationEnabled
    });
  },

  onRadiusChange(e) {
    this.setData({ searchRadius: e.detail.value });
    this.saveSettings();
  },

  onShakeToggle(e) {
    this.setData({ shakeEnabled: e.detail.value });
    this.saveSettings();
  },

  onNotificationToggle(e) {
    this.setData({ notificationEnabled: e.detail.value });
    this.saveSettings();
  },

  clearHistory() {
    wx.showModal({
      title: '清除记录',
      content: '确定要清除所有用餐记录吗？此操作不可恢复。',
      confirmColor: '#FF3B30',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('history');
          wx.showToast({ title: '已清除', icon: 'success' });
        }
      }
    });
  },

  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除应用缓存吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          this.setData({ cacheSize: '0MB' });
          wx.showToast({ title: '已清除', icon: 'success' });
        }
      }
    });
  },

  showPrivacy() {
    wx.showToast({ title: '隐私政策', icon: 'none' });
  },

  showTerms() {
    wx.showToast({ title: '用户协议', icon: 'none' });
  },

  contactUs() {
    wx.showModal({
      title: '联系我们',
      content: '邮箱：support@eato.app',
      showCancel: false
    });
  }
});

