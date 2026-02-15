/**
 * Eato - 菜单推荐结果页
 */
Page({
  data: {
    currentScheme: 0,
    currentTotal: 168,
    schemes: [
      {
        totalPrice: 168,
        peopleCount: 3,
        dishCount: 5,
        reason: '根据您的预算和3人用餐需求，推荐经典川菜组合，荤素搭配均衡，口味丰富。',
        dishes: [
          { id: 1, name: '水煮鱼', price: 68, quantity: 1, isSpicy: true, isRecommended: true, description: '招牌菜，麻辣鲜香' },
          { id: 2, name: '宫保鸡丁', price: 38, quantity: 1, isSpicy: true, description: '经典川菜' },
          { id: 3, name: '蒜蓉西兰花', price: 28, quantity: 1, description: '清淡爽口' },
          { id: 4, name: '酸辣土豆丝', price: 22, quantity: 1, isSpicy: true, description: '开胃下饭' },
          { id: 5, name: '米饭', price: 4, quantity: 3, description: '精选东北大米' }
        ]
      },
      {
        totalPrice: 198,
        peopleCount: 3,
        dishCount: 6,
        reason: '丰富版方案，增加了一道汤品，营养更均衡，适合商务聚餐。',
        dishes: [
          { id: 1, name: '水煮鱼', price: 68, quantity: 1, isSpicy: true, isRecommended: true, description: '招牌菜' },
          { id: 2, name: '回锅肉', price: 42, quantity: 1, isSpicy: true, description: '下饭神器' },
          { id: 3, name: '干煸四季豆', price: 32, quantity: 1, description: '香脆可口' },
          { id: 4, name: '番茄蛋汤', price: 18, quantity: 1, description: '酸甜开胃' },
          { id: 5, name: '凉拌黄瓜', price: 16, quantity: 1, description: '清爽解腻' },
          { id: 6, name: '米饭', price: 4, quantity: 3, description: '精选东北大米' }
        ]
      }
    ]
  },

  onLoad(options) {
    this.calculateTotal();
  },

  // 切换方案
  switchScheme(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ currentScheme: index });
    this.calculateTotal();
  },

  // 计算总价
  calculateTotal() {
    const scheme = this.data.schemes[this.data.currentScheme];
    const total = scheme.dishes.reduce((sum, dish) => sum + dish.price * dish.quantity, 0);
    this.setData({ currentTotal: total });
  },

  // 增加数量
  increaseQuantity(e) {
    const id = e.currentTarget.dataset.id;
    const dishes = this.data.schemes[this.data.currentScheme].dishes;
    const index = dishes.findIndex(d => d.id === id);
    if (index > -1 && dishes[index].quantity < 10) {
      this.setData({
        [`schemes[${this.data.currentScheme}].dishes[${index}].quantity`]: dishes[index].quantity + 1
      });
      this.calculateTotal();
    }
  },

  // 减少数量
  decreaseQuantity(e) {
    const id = e.currentTarget.dataset.id;
    const dishes = this.data.schemes[this.data.currentScheme].dishes;
    const index = dishes.findIndex(d => d.id === id);
    if (index > -1 && dishes[index].quantity > 0) {
      this.setData({
        [`schemes[${this.data.currentScheme}].dishes[${index}].quantity`]: dishes[index].quantity - 1
      });
      this.calculateTotal();
    }
  },

  // 重新生成
  regenerate() {
    wx.showLoading({ title: '重新推荐中...' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '已更新推荐', icon: 'success' });
    }, 1500);
  },

  // 确认点餐
  confirmOrder() {
    wx.showToast({
      title: '点餐清单已保存',
      icon: 'success'
    });
    
    setTimeout(() => {
      wx.navigateBack({ delta: 2 });
    }, 1500);
  }
});

