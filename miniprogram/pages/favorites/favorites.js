/**
 * Eato - 收藏页面
 */
Page({
  data: {
    restaurants: [
      {
        id: '1',
        name: '川味小馆',
        image: '/assets/images/restaurant-1.jpg',
        rating: 4.8,
        category: '川菜',
        avgPrice: 68,
        address: '朝阳区建国路88号'
      },
      {
        id: '2',
        name: '粤式茶餐厅',
        image: '/assets/images/restaurant-2.jpg',
        rating: 4.6,
        category: '粤菜',
        avgPrice: 85,
        address: '海淀区中关村大街1号'
      }
    ]
  },

  viewRestaurant(e) {
    const id = e.currentTarget.dataset.id;
    // TODO: 跳转到餐厅详情
    wx.showToast({ title: '查看餐厅详情', icon: 'none' });
  },

  toggleFavorite(e) {
    const id = e.currentTarget.dataset.id;
    const restaurants = this.data.restaurants.filter(r => r.id !== id);
    this.setData({ restaurants });
    wx.showToast({ title: '已取消收藏', icon: 'success' });
  }
});

