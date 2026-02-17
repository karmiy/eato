/**
 * Eato - 成员编辑页面
 */
const memberStore = require('../../stores/memberStore');
const userStore = require('../../stores/userStore');

// 辣度映射
const SPICY_MAP = {
  'none': 1,
  'mild': 2,
  'medium': 3,
  'hot': 5
};

const SPICY_REVERSE = {
  1: 'none',
  2: 'mild',
  3: 'medium',
  4: 'medium',
  5: 'hot'
};

Page({
  data: {
    isEdit: false,
    memberId: '',
    member: {
      id: '',
      name: '',
      color: 'linear-gradient(135deg, #FF6B9D 0%, #FF9EC4 100%)',
      spicy: 'mild',
      cuisines: [],
      restrictions: [],
      budgetMin: '',
      budgetMax: '',
      notes: ''
    },
    // 选中状态（用于 UI 显示，解决 includes 在 wxml 中的问题）
    selectedCuisines: {},
    selectedRestrictions: {},
    spicyOptions: [
      { label: '不辣', value: 'none' },
      { label: '微辣', value: 'mild' },
      { label: '中辣', value: 'medium' },
      { label: '重辣', value: 'hot' }
    ],
    // 扩充的菜系选项
    cuisineOptions: [
      '川菜', '粤菜', '湘菜', '江浙菜', '东北菜', '鲁菜', '闽菜', '徽菜',
      '云南菜', '贵州菜', '新疆菜', '西北菜', '客家菜', '潮汕菜', '台湾菜',
      '火锅', '烧烤', '小龙虾', '海鲜', '自助餐',
      '西餐', '日料', '韩餐', '泰餐', '越南菜', '东南亚菜', '印度菜',
      '快餐', '轻食', '素食', '甜品', '面食', '粥粉面'
    ],
    // 扩充的饮食禁忌选项
    restrictionOptions: [
      // 过敏类
      '海鲜过敏', '虾蟹过敏', '贝类过敏', '鱼类过敏',
      '坚果过敏', '花生过敏', '鸡蛋过敏', '牛奶过敏', '大豆过敏',
      '小麦过敏', '芒果过敏', '菠萝过敏',
      // 不吃类
      '不吃香菜', '不吃葱', '不吃蒜', '不吃姜', '不吃辣椒',
      '不吃内脏', '不吃肥肉', '不吃羊肉', '不吃牛肉', '不吃猪肉',
      // 特殊饮食
      '素食', '纯素', '清真', '乳糖不耐', '麸质不耐',
      '低糖饮食', '低盐饮食', '低脂饮食', '生酮饮食'
    ]
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ isEdit: true, memberId: options.id });
      this.loadMember(options.id);
    }
  },

  loadMember(id) {
    const memberData = memberStore.getMemberById(id);
    if (memberData) {
      // 转换后端数据格式为页面数据格式
      const spicyLevel = memberData.taste_preferences?.spicy || 2;
      const cuisines = memberData.cuisine_preferences || [];
      const restrictions = memberData.dietary_restrictions || [];

      // 构建选中状态对象
      const selectedCuisines = {};
      cuisines.forEach(c => selectedCuisines[c] = true);
      const selectedRestrictions = {};
      restrictions.forEach(r => selectedRestrictions[r] = true);

      this.setData({
        member: {
          id: memberData.id,
          name: memberData.name || '',
          color: memberData.color || 'linear-gradient(135deg, #FF6B9D 0%, #FF9EC4 100%)',
          spicy: SPICY_REVERSE[spicyLevel] || 'mild',
          cuisines,
          restrictions,
          budgetMin: memberData.budget_min ? String(memberData.budget_min) : '',
          budgetMax: memberData.budget_max ? String(memberData.budget_max) : '',
          notes: memberData.notes || ''
        },
        selectedCuisines,
        selectedRestrictions
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
    const selectedCuisines = { ...this.data.selectedCuisines };

    if (cuisines.includes(value)) {
      cuisines = cuisines.filter(c => c !== value);
      delete selectedCuisines[value];
    } else {
      cuisines.push(value);
      selectedCuisines[value] = true;
    }

    this.setData({
      'member.cuisines': cuisines,
      selectedCuisines
    });
  },

  toggleRestriction(e) {
    const value = e.currentTarget.dataset.value;
    let restrictions = [...this.data.member.restrictions];
    const selectedRestrictions = { ...this.data.selectedRestrictions };

    if (restrictions.includes(value)) {
      restrictions = restrictions.filter(r => r !== value);
      delete selectedRestrictions[value];
    } else {
      restrictions.push(value);
      selectedRestrictions[value] = true;
    }

    this.setData({
      'member.restrictions': restrictions,
      selectedRestrictions
    });
  },

  onBudgetMinInput(e) {
    this.setData({ 'member.budgetMin': e.detail.value });
  },

  onBudgetMaxInput(e) {
    this.setData({ 'member.budgetMax': e.detail.value });
  },

  onNotesInput(e) {
    this.setData({ 'member.notes': e.detail.value });
  },

  async saveMember() {
    const { member, isEdit, memberId } = this.data;

    if (!member.name.trim()) {
      wx.showToast({ title: '请输入成员名称', icon: 'none' });
      return;
    }

    // 转换为后端数据格式
    const data = {
      user_id: userStore.getUserId(),
      name: member.name,
      taste_preferences: {
        spicy: SPICY_MAP[member.spicy] || 2,
        sweet: 3,
        sour: 3,
        oily: 3
      },
      cuisine_preferences: member.cuisines,
      dietary_restrictions: member.restrictions,
      budget_min: member.budgetMin ? parseInt(member.budgetMin) : null,
      budget_max: member.budgetMax ? parseInt(member.budgetMax) : null,
      notes: member.notes || null
    };

    try {
      if (isEdit) {
        await memberStore.updateMember(memberId, data);
      } else {
        await memberStore.createMember(data);
      }
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (err) {
      wx.showToast({ title: err.message || '保存失败', icon: 'none' });
    }
  },

  deleteMember() {
    const { memberId } = this.data;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个成员吗？',
      confirmColor: '#FF3B30',
      success: async (res) => {
        if (res.confirm) {
          try {
            await memberStore.deleteMember(memberId);
            wx.showToast({ title: '已删除', icon: 'success' });
            setTimeout(() => wx.navigateBack(), 1500);
          } catch (err) {
            wx.showToast({ title: err.message || '删除失败', icon: 'none' });
          }
        }
      }
    });
  }
});

