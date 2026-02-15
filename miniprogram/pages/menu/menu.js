/**
 * Eato - 点什么菜页面
 */
const app = getApp();

Page({
  data: {
    statusBarHeight: 20,
    hasHistory: true
  },

  onLoad() {
    // 获取状态栏高度
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20
    });
  },

  onShow() {
    // 设置 TabBar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(1);
    }
  },

  // 扫描菜单
  scanMenu() {
    wx.showActionSheet({
      itemList: ['拍摄菜单', '从相册选择'],
      success: (res) => {
        const sourceType = res.tapIndex === 0 ? ['camera'] : ['album'];
        this.chooseImage(sourceType);
      }
    });
  },

  // 选择图片
  chooseImage(sourceType) {
    wx.chooseMedia({
      count: 3,
      mediaType: ['image'],
      sourceType: sourceType,
      success: (res) => {
        const images = res.tempFiles.map(file => file.tempFilePath);
        // 跳转到菜单扫描页面
        wx.navigateTo({
          url: '/pages/menu-scan/menu-scan?images=' + encodeURIComponent(JSON.stringify(images))
        });
      },
      fail: (err) => {
        if (err.errMsg.indexOf('cancel') === -1) {
          wx.showToast({
            title: '选择图片失败',
            icon: 'none'
          });
        }
      }
    });
  },

  // 查看历史记录
  goToHistory() {
    wx.navigateTo({
      url: '/pages/history/history'
    });
  }
});

