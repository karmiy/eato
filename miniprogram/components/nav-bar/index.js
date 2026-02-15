/**
 * Eato - 导航栏组件
 */
const app = getApp();

Component({
  options: {
    multipleSlots: true
  },

  properties: {
    title: {
      type: String,
      value: ''
    },
    showBack: {
      type: Boolean,
      value: false
    },
    transparent: {
      type: Boolean,
      value: false
    }
  },

  data: {
    statusBarHeight: 20,
    navBarHeight: 44
  },

  lifetimes: {
    attached() {
      this.setData({
        statusBarHeight: app.globalData.statusBarHeight || 20,
        navBarHeight: app.globalData.navBarHeight || 44
      });
    }
  },

  methods: {
    goBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        wx.navigateBack();
      } else {
        wx.switchTab({ url: '/pages/home/home' });
      }
    }
  }
});

