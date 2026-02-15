/**
 * Eato - 推荐结果页
 */
Page({
  data: {
    restaurant: {
      id: '1',
      name: '川味小馆',
      image: '',
      rating: 4.7,
      avgPrice: 68,
      distance: '500m',
      cuisine: '川菜',
      isOpen: true,
      businessHours: '10:00-22:00',
      isFavorite: false,
      reason: '这是一家评分很高的川菜馆，招牌菜水煮鱼和宫保鸡丁广受好评。距离您很近，人均消费适中，非常适合今天的用餐选择。'
    }
  },

  onLoad(options) {
    // TODO: 根据筛选条件调用 API 获取推荐
    this.fetchRecommendation();
  },

  // 获取推荐
  async fetchRecommendation() {
    wx.showLoading({ title: '正在推荐...' });
    
    // TODO: 调用后端 API
    setTimeout(() => {
      wx.hideLoading();
    }, 500);
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
  nextRecommend() {
    wx.vibrateShort({ type: 'light' });
    
    // TODO: 调用 API 获取下一个推荐
    wx.showLoading({ title: '换一家...' });
    
    setTimeout(() => {
      wx.hideLoading();
      // 模拟更新数据
      this.setData({
        'restaurant.name': '粤式茶餐厅',
        'restaurant.cuisine': '粤菜',
        'restaurant.rating': 4.5,
        'restaurant.avgPrice': 55,
        'restaurant.distance': '800m',
        'restaurant.reason': '正宗粤式茶餐厅，早茶点心品种丰富，虾饺和叉烧包是必点。环境舒适，服务周到。'
      });
    }, 800);
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
  }
});

