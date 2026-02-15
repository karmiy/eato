/**
 * Eato - 首页（吃哪家）
 */
const app = getApp();

Page({
  data: {
    statusBarHeight: 20,
    isShaking: false,
    hasNotification: false,
    location: '中关村',
    distance: 3,
    budget: null,
    budgetText: '不限',
    cuisine: [],
    cuisineText: '不限',
    members: [],
    membersText: '自己'
  },

  onLoad() {
    // 获取状态栏高度
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20
    });
    this.initLocation();
    this.initShakeListener();
  },

  onShow() {
    // 设置 TabBar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(0);
    }
  },

  // 初始化位置
  async initLocation() {
    try {
      await app.getLocation();
      // TODO: 根据坐标获取位置名称
    } catch (err) {
      console.log('获取位置失败，使用默认位置');
    }
  },

  // 初始化摇一摇监听
  initShakeListener() {
    wx.onAccelerometerChange((res) => {
      if (Math.abs(res.x) > 1.5 || Math.abs(res.y) > 1.5 || Math.abs(res.z) > 1.5) {
        if (!this.data.isShaking) {
          this.startRecommend();
        }
      }
    });
    
    wx.startAccelerometer({ interval: 'normal' });
  },

  // 开始推荐
  startRecommend() {
    if (this.data.isShaking) return;
    
    this.setData({ isShaking: true });
    
    // 震动反馈
    wx.vibrateShort({ type: 'medium' });
    
    // 模拟加载后跳转
    setTimeout(() => {
      this.setData({ isShaking: false });
      wx.navigateTo({
        url: '/pages/result/result'
      });
    }, 1500);
  },

  // 选择位置
  selectLocation() {
    wx.showActionSheet({
      itemList: ['1km内', '3km内', '5km内', '10km内'],
      success: (res) => {
        const distances = [1, 3, 5, 10];
        this.setData({ distance: distances[res.tapIndex] });
      }
    });
  },

  // 选择预算
  selectBudget() {
    wx.showActionSheet({
      itemList: ['不限', '30元以下', '30-60元', '60-100元', '100元以上'],
      success: (res) => {
        const budgets = [null, 30, 60, 100, 200];
        const texts = ['不限', '30元以下', '30-60元', '60-100元', '100元以上'];
        this.setData({
          budget: budgets[res.tapIndex],
          budgetText: texts[res.tapIndex]
        });
      }
    });
  },

  // 选择菜系
  selectCuisine() {
    wx.showActionSheet({
      itemList: ['不限', '中餐', '西餐', '日韩料理', '东南亚菜', '火锅烧烤'],
      success: (res) => {
        const cuisines = [[], ['中餐'], ['西餐'], ['日韩'], ['东南亚'], ['火锅', '烧烤']];
        const texts = ['不限', '中餐', '西餐', '日韩料理', '东南亚菜', '火锅烧烤'];
        this.setData({
          cuisine: cuisines[res.tapIndex],
          cuisineText: texts[res.tapIndex]
        });
      }
    });
  },

  // 选择用餐成员
  selectMembers() {
    wx.navigateTo({
      url: '/pages/members/members?mode=select'
    });
  },

  onUnload() {
    wx.stopAccelerometer();
  }
});

