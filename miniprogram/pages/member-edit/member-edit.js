/**
 * Eato - 成员编辑页面
 */
const memberStore = require('../../stores/memberStore');
const userStore = require('../../stores/userStore');
const { CUISINE_OPTIONS, RESTRICTION_OPTIONS } = require('../../constants/options');

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
    // 菜系分组（从共享常量生成）
    cuisineGroups: (() => {
      const groupMap = {};
      const groupOrder = ['中餐', '火锅烧烤', '小吃快餐', '异国料理', '其他'];
      CUISINE_OPTIONS.forEach(item => {
        const group = item.group || '其他';
        if (!groupMap[group]) {
          groupMap[group] = { name: group, items: [] };
        }
        groupMap[group].items.push(item);
      });
      return groupOrder.map(name => groupMap[name]).filter(Boolean);
    })(),
    // 饮食禁忌选项（从共享常量获取，提取 value）
    restrictionOptions: RESTRICTION_OPTIONS.map(item => item.value)
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

