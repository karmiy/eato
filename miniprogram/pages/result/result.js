/**
 * Eato - 推荐结果页
 */
const app = getApp();
const recommendService = require('../../services/recommendService');
const userStore = require('../../stores/userStore');

Page({
  data: {
    loading: true,
    restaurant: null,
    remaining: 0,
    error: null
  },

  // 推荐参数
  recommendParams: null,

  onLoad(options) {
    // 从全局获取推荐参数
    this.recommendParams = app.globalData.recommendParams;
    this.fetchRecommendation();
  },

  // 获取推荐
  async fetchRecommendation() {
    if (!this.recommendParams) {
      this.setData({
        loading: false,
        error: '缺少推荐参数，请返回首页重试'
      });
      return;
    }

    this.setData({ loading: true, error: null });

    try {
      const result = await recommendService.getRecommendation(this.recommendParams);

      if (result.restaurant) {
        const r = result.restaurant;
        this.setData({
          loading: false,
          restaurant: {
            id: r.id,
            name: r.name,
            image: r.photos && r.photos[0] || '',
            images: r.photos || [],
            rating: r.rating || 0,
            avgPrice: r.cost || 0,
            distance: this.formatDistance(r.distance),
            cuisine: r.keytag || r.type || '餐厅',  // 优先用 keytag
            tags: r.tags || [],  // 特色菜品标签
            address: r.address || '',
            cityname: r.cityname || '',
            businessArea: r.business_area || '',  // 商圈
            tel: r.tel || '',
            location: r.location,
            opentime: r.opentime || '',
            isOpen: this.checkIsOpen(r.opentime),
            isFavorite: false,
            reason: r.reason || '为您精选推荐',
            score: r.score || 0
          },
          remaining: result.remaining || 0
        });
      } else {
        this.setData({
          loading: false,
          error: '暂无推荐，请调整筛选条件'
        });
      }
    } catch (err) {
      console.error('获取推荐失败', err);
      this.setData({
        loading: false,
        error: err.message || '获取推荐失败'
      });
    }
  },

  // 格式化距离
  formatDistance(meters) {
    if (!meters) return '';
    if (meters < 1000) {
      return `${meters}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  },

  // 检查是否营业中（简单判断）
  checkIsOpen(opentime) {
    if (!opentime) return true; // 无营业时间默认营业
    // 简单实现：暂时返回 true，后续可根据 opentime 精确判断
    return true;
  },

  // 拨打电话
  callRestaurant() {
    const tel = this.data.restaurant.tel;
    if (!tel) {
      wx.showToast({ title: '暂无电话信息', icon: 'none' });
      return;
    }
    wx.makePhoneCall({
      phoneNumber: tel.split(';')[0], // 取第一个电话
      fail: () => {}
    });
  },

  // 导航到餐厅
  navigateToRestaurant() {
    const { name, location, address } = this.data.restaurant;
    if (!location) {
      wx.showToast({ title: '暂无位置信息', icon: 'none' });
      return;
    }
    const [lng, lat] = location.split(',');
    wx.openLocation({
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      name: name,
      address: address,
      scale: 18
    });
  },

  // 切换收藏
  toggleFavorite() {
    const isFavorite = !this.data.restaurant.isFavorite;
    this.setData({
      'restaurant.isFavorite': isFavorite
    });
    
    wx.showToast({
      title: isFavorite ? '已收藏' : '已取消收藏',
      icon: 'none'
    });
    
    // TODO: 调用 API 更新收藏状态
  },

  // 换一家
  async nextRecommend() {
    if (this.data.remaining <= 0) {
      wx.showToast({ title: '没有更多推荐了', icon: 'none' });
      return;
    }

    wx.vibrateShort({ type: 'light' });

    // 再次调用同样的接口，会从缓存取下一个
    await this.fetchRecommendation();
  },

  // 确认选择
  confirmRestaurant() {
    wx.vibrateShort({ type: 'medium' });

    // TODO: 记录用餐选择

    // 直接弹出选项
    wx.showActionSheet({
      itemList: ['查看详情', '导航前往', '返回首页'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.viewRestaurantDetail();
        } else if (res.tapIndex === 1) {
          this.navigateToRestaurant();
        } else if (res.tapIndex === 2) {
          wx.switchTab({ url: '/pages/home/home' });
        }
      }
    });
  },

  // 查看餐厅详情 - 提供多个平台选项
  viewRestaurantDetail() {
    const { name, city } = this.data.restaurant;
    if (!name) {
      wx.showToast({ title: '暂无餐厅信息', icon: 'none' });
      return;
    }

    // 先复制店名，方便用户搜索
    wx.setClipboardData({
      data: name,
      success: () => {
        // 让用户选择跳转哪个平台
        wx.showActionSheet({
          itemList: ['大众点评', '美团', '高德地图'],
          success: (res) => {
            if (res.tapIndex === 0) {
              // 跳转大众点评小程序
              this.jumpToDianping(name);
            } else if (res.tapIndex === 1) {
              // 跳转美团小程序
              this.jumpToMeituan(name);
            } else if (res.tapIndex === 2) {
              // 跳转高德地图小程序
              this.jumpToAmap(name, city);
            }
          }
        });
      }
    });
  },

  // 跳转大众点评
  jumpToDianping(name) {
    wx.navigateToMiniProgram({
      appId: 'wx7b3a6a35686aed72',  // 大众点评生活服务
      path: `pages/search/index?keyword=${encodeURIComponent(name)}`,
      envVersion: 'release',
      fail: (err) => {
        console.error('跳转大众点评失败', err);
        wx.showModal({
          title: '店名已复制',
          content: '请手动打开大众点评 App 搜索',
          showCancel: false
        });
      }
    });
  },

  // 跳转美团
  jumpToMeituan(name) {
    wx.navigateToMiniProgram({
      appId: 'wxde8ac0a21135c07d',  // 美团
      envVersion: 'release',
      fail: (err) => {
        console.error('跳转美团失败', err);
        wx.showModal({
          title: '店名已复制',
          content: '请手动打开美团 App 搜索',
          showCancel: false
        });
      }
    });
  },

  // 跳转高德地图搜索
  jumpToAmap(name, city) {
    const keyword = city ? `${city}${name}` : name;
    wx.navigateToMiniProgram({
      appId: 'wx39e350c321ae2ab3',  // 高德地图
      path: `pages/search/index?query=${encodeURIComponent(keyword)}`,
      envVersion: 'release',
      fail: (err) => {
        console.error('跳转高德地图失败', err);
        // 使用微信内置地图作为备选
        this.navigateToRestaurant();
      }
    });
  },

  // 加入黑名单
  addToBlacklist() {
    wx.showModal({
      title: '不再推荐',
      content: '确定不再推荐这家餐厅吗？',
      confirmColor: '#FF6B9D',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '已加入黑名单',
            icon: 'none'
          });
          // TODO: 调用 API 加入黑名单
          this.nextRecommend();
        }
      }
    });
  },

  // 返回首页
  goBack() {
    wx.switchTab({ url: '/pages/home/home' });
  }
});

