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
    
    // 显示成功动画
    wx.showToast({
      title: '好的！就这家',
      icon: 'success'
    });

    // TODO: 记录用餐选择
    
    setTimeout(() => {
      // 可以跳转到详情页或导航
      wx.showActionSheet({
        itemList: ['查看详情', '导航前往', '返回首页'],
        success: (res) => {
          if (res.tapIndex === 2) {
            wx.switchTab({ url: '/pages/home/home' });
          }
        }
      });
    }, 1500);
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

