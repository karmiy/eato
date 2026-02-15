/**
 * Eato - 黑名单页面
 */
Page({
  data: {
    restaurants: [
      {
        id: '1',
        name: '某某餐厅',
        reason: '服务态度差'
      },
      {
        id: '2',
        name: '另一家餐厅',
        reason: '卫生问题'
      }
    ]
  },

  removeFromBlacklist(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '移除黑名单',
      content: '确定要将该餐厅从黑名单中移除吗？',
      success: (res) => {
        if (res.confirm) {
          const restaurants = this.data.restaurants.filter(r => r.id !== id);
          this.setData({ restaurants });
          wx.showToast({ title: '已移除', icon: 'success' });
        }
      }
    });
  }
});

