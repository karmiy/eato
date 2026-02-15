/**
 * Eato - 成员编辑页面
 */
Page({
  data: {
    isEdit: false,
    member: {
      id: '',
      name: '',
      color: 'linear-gradient(135deg, #FF6B9D 0%, #FF9EC4 100%)',
      spicy: 'mild',
      cuisines: [],
      restrictions: [],
      budgetMin: '',
      budgetMax: ''
    },
    spicyOptions: [
      { label: '不辣', value: 'none' },
      { label: '微辣', value: 'mild' },
      { label: '中辣', value: 'medium' },
      { label: '重辣', value: 'hot' }
    ],
    cuisineOptions: ['川菜', '粤菜', '湘菜', '江浙菜', '东北菜', '西餐', '日料', '韩餐', '火锅', '烧烤'],
    restrictionOptions: ['不吃香菜', '不吃葱', '不吃蒜', '海鲜过敏', '坚果过敏', '乳糖不耐', '素食', '清真']
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ isEdit: true });
      this.loadMember(options.id);
    }
  },

  loadMember(id) {
    // TODO: 从存储加载成员数据
    // 模拟数据
    if (id === '1') {
      this.setData({
        member: {
          id: '1',
          name: '我',
          color: 'linear-gradient(135deg, #FF6B9D 0%, #FF9EC4 100%)',
          spicy: 'mild',
          cuisines: ['川菜'],
          restrictions: ['不吃香菜'],
          budgetMin: '30',
          budgetMax: '80'
        }
      });
    }
  },

  onNameInput(e) {
    this.setData({ 'member.name': e.detail.value });
  },

  setSpicy(e) {
    this.setData({ 'member.spicy': e.currentTarget.dataset.value });
  },

  toggleCuisine(e) {
    const value = e.currentTarget.dataset.value;
    let cuisines = [...this.data.member.cuisines];
    
    if (cuisines.includes(value)) {
      cuisines = cuisines.filter(c => c !== value);
    } else {
      cuisines.push(value);
    }
    
    this.setData({ 'member.cuisines': cuisines });
  },

  toggleRestriction(e) {
    const value = e.currentTarget.dataset.value;
    let restrictions = [...this.data.member.restrictions];
    
    if (restrictions.includes(value)) {
      restrictions = restrictions.filter(r => r !== value);
    } else {
      restrictions.push(value);
    }
    
    this.setData({ 'member.restrictions': restrictions });
  },

  onBudgetMinInput(e) {
    this.setData({ 'member.budgetMin': e.detail.value });
  },

  onBudgetMaxInput(e) {
    this.setData({ 'member.budgetMax': e.detail.value });
  },

  saveMember() {
    if (!this.data.member.name.trim()) {
      wx.showToast({ title: '请输入成员名称', icon: 'none' });
      return;
    }

    // TODO: 保存到存储
    wx.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 1500);
  },

  deleteMember() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个成员吗？',
      confirmColor: '#FF3B30',
      success: (res) => {
        if (res.confirm) {
          // TODO: 从存储删除
          wx.showToast({ title: '已删除', icon: 'success' });
          setTimeout(() => wx.navigateBack(), 1500);
        }
      }
    });
  }
});

