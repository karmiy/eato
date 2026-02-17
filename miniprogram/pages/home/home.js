/**
 * Eato - 首页（吃哪家）
 */
const app = getApp();
const memberService = require('../../services/memberService');
const userStore = require('../../stores/userStore');
const { CUISINE_OPTIONS, DISTANCE_OPTIONS, BUDGET_OPTIONS } = require('../../constants/options');

Page({
  data: {
    statusBarHeight: 20,
    isShaking: false,
    hasNotification: false,
    location: '获取中...',
    latitude: null,
    longitude: null,
    distance: 3,
    budgetMin: null,
    budgetMax: null,
    budgetText: '不限',
    cuisine: [],
    cuisineText: '不限',
    members: [],          // 成员对象数组
    selectedMemberIds: [], // 选中的成员 ID
    membersText: '点击选择',
    // 菜系多选弹窗
    showCuisinePopup: false,
    cuisineGroups: [],
    tempSelectedCuisines: []
  },

  onLoad() {
    // 获取状态栏高度，初始化菜系分组
    const groupMap = {};
    const groupOrder = ['中餐', '火锅烧烤', '小吃快餐', '异国料理', '其他'];
    CUISINE_OPTIONS.forEach(item => {
      const group = item.group || '其他';
      if (!groupMap[group]) {
        groupMap[group] = { name: group, items: [] };
      }
      groupMap[group].items.push(item);
    });
    const cuisineGroups = groupOrder.map(name => groupMap[name]).filter(Boolean);

    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20,
      cuisineGroups
    });
    // 不再主动获取位置，等用户摇一摇时再获取
    this.initShakeListener();
  },

  onShow() {
    // 设置 TabBar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(0);
    }
    // 刷新成员列表
    this.loadMembers();
  },

  // 加载成员列表
  async loadMembers() {
    try {
      const userId = userStore.getUserId();
      const members = await memberService.getMembers(userId);
      this.setData({ members });
    } catch (err) {
      console.error('加载成员失败', err);
    }
  },

  // 初始化位置
  async initLocation() {
    // 先检查权限状态
    const setting = await new Promise(resolve => {
      wx.getSetting({ success: resolve, fail: () => resolve({}) });
    });

    const authStatus = setting.authSetting?.['scope.userLocation'];

    // 如果已明确拒绝，显示提示
    if (authStatus === false) {
      this.setData({ location: '未授权位置' });
      this.showLocationAuthTip();
      return;
    }

    // 否则尝试获取位置（首次会自动弹系统授权框）
    try {
      const location = await app.getLocation();
      if (location) {
        this.setData({
          latitude: location.latitude,
          longitude: location.longitude,
          location: '已获取位置'
        });
      }
    } catch (err) {
      console.log('获取位置失败', err);
      // 可能是用户刚才拒绝了系统授权框
      this.setData({ location: '未授权位置' });
    }
  },

  // 显示位置授权提示（只在明确拒绝后调用）
  showLocationAuthTip() {
    wx.showModal({
      title: '需要位置权限',
      content: '开启位置权限后才能推荐附近餐厅哦~',
      cancelText: '下次再说',
      confirmText: '去开启',
      success: (res) => {
        if (res.confirm) {
          wx.openSetting({
            success: (settingRes) => {
              if (settingRes.authSetting['scope.userLocation']) {
                this.initLocation();
              }
            }
          });
        }
      }
    });
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

    const { latitude, longitude, distance, budgetMin, budgetMax, cuisine, selectedMemberIds } = this.data;

    // 检查是否选择了成员
    if (selectedMemberIds.length === 0) {
      wx.showToast({ title: '请先选择用餐成员', icon: 'none' });
      return;
    }

    // 检查位置
    if (!latitude || !longitude) {
      wx.showToast({ title: '正在获取位置...', icon: 'none' });
      this.initLocation();
      return;
    }

    this.setData({ isShaking: true });

    // 震动反馈
    wx.vibrateShort({ type: 'medium' });

    // 准备推荐参数
    const params = {
      user_id: userStore.getUserId(),
      member_ids: selectedMemberIds.length > 0 ? selectedMemberIds : [],
      latitude,
      longitude,
      radius: distance * 1000,  // km -> m
      budget_min: budgetMin,
      budget_max: budgetMax,
      cuisines: cuisine.length > 0 ? cuisine : null  // 用户选择的菜系（不限时为 null）
    };

    // 存储参数到全局，供结果页使用
    app.globalData.recommendParams = params;

    // 延迟跳转（动画效果）
    setTimeout(() => {
      this.setData({ isShaking: false });
      wx.navigateTo({
        url: '/pages/result/result'
      });
    }, 800);
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
        // [min, max] 区间
        const budgetRanges = [
          [null, null],  // 不限
          [null, 30],    // 30元以下
          [30, 60],      // 30-60元
          [60, 100],     // 60-100元
          [100, null]    // 100元以上
        ];
        const texts = ['不限', '30元以下', '30-60元', '60-100元', '100元以上'];
        const range = budgetRanges[res.tapIndex];
        this.setData({
          budgetMin: range[0],
          budgetMax: range[1],
          budgetText: texts[res.tapIndex]
        });
      }
    });
  },

  // 选择菜系（打开多选弹窗）
  selectCuisine() {
    this.setData({
      showCuisinePopup: true,
      tempSelectedCuisines: [...this.data.cuisine]
    });
  },

  // 切换菜系选择
  toggleCuisine(e) {
    const value = e.currentTarget.dataset.value;
    let { tempSelectedCuisines } = this.data;

    if (tempSelectedCuisines.includes(value)) {
      tempSelectedCuisines = tempSelectedCuisines.filter(c => c !== value);
    } else {
      tempSelectedCuisines = [...tempSelectedCuisines, value];
    }

    this.setData({ tempSelectedCuisines });
  },

  // 确认菜系选择
  confirmCuisine() {
    const { tempSelectedCuisines } = this.data;
    const cuisineText = tempSelectedCuisines.length > 0
      ? tempSelectedCuisines.slice(0, 3).join('、') + (tempSelectedCuisines.length > 3 ? '...' : '')
      : '不限';

    this.setData({
      cuisine: tempSelectedCuisines,
      cuisineText,
      showCuisinePopup: false
    });
  },

  // 取消菜系选择
  cancelCuisine() {
    this.setData({ showCuisinePopup: false });
  },

  // 清空菜系选择
  clearCuisine() {
    this.setData({ tempSelectedCuisines: [] });
  },

  // 选择用餐成员
  selectMembers() {
    const { selectedMemberIds } = this.data;
    const selected = encodeURIComponent(JSON.stringify(selectedMemberIds));
    wx.navigateTo({
      url: `/pages/members/members?mode=select&selected=${selected}`
    });
  },

  onUnload() {
    wx.stopAccelerometer();
  }
});

