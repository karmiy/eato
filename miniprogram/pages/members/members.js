/**
 * Eato - 吃货档案页面
 */
const memberStore = require('../../stores/memberStore');
const userStore = require('../../stores/userStore');

Page({
  data: {
    isSelectMode: false,
    selectedIds: [],
    members: [],
    loading: false
  },

  // Store 取消订阅函数
  _unsubscribe: null,

  onLoad(options) {
    // 订阅 store 变化
    this._unsubscribe = memberStore.subscribe((state) => {
      this.setData({
        members: state.members,
        loading: state.loading
      });
    });

    if (options.mode === 'select') {
      this.setData({ isSelectMode: true });

      // 恢复已选状态
      if (options.selected) {
        try {
          const selectedIds = JSON.parse(decodeURIComponent(options.selected));
          this.setData({ selectedIds });
        } catch (e) {}
      }
    }

    // 加载数据
    this._loadMembers();
  },

  onShow() {
    // 每次显示页面时刷新数据（编辑后返回）
    if (this._hasLoaded) {
      this._loadMembers();
    }
  },

  onUnload() {
    // 取消订阅
    if (this._unsubscribe) {
      this._unsubscribe();
    }
  },

  async _loadMembers() {
    try {
      const userId = userStore.getUserId();
      await memberStore.loadMembers(userId);
      this._hasLoaded = true;
    } catch (err) {
      wx.showToast({ title: err.message || '加载失败', icon: 'none' });
    }
  },

  // 切换选择
  toggleSelect(e) {
    const id = e.currentTarget.dataset.id;
    let { selectedIds } = this.data;
    
    if (selectedIds.includes(id)) {
      selectedIds = selectedIds.filter(i => i !== id);
    } else {
      selectedIds.push(id);
    }
    
    this.setData({ selectedIds });
  },

  // 确认选择
  confirmSelect() {
    const selectedMembers = this.data.members.filter(m => 
      this.data.selectedIds.includes(m.id)
    );
    
    // 返回上一页并传递选中的成员
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    
    if (prevPage) {
      prevPage.setData({
        selectedMembers,
        membersText: selectedMembers.length > 0 
          ? selectedMembers.map(m => m.name).join('、')
          : '自己'
      });
    }
    
    wx.navigateBack();
  },

  // 编辑成员
  editMember(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/member-edit/member-edit?id=${id}`
    });
  },

  // 添加成员
  addMember() {
    wx.navigateTo({
      url: '/pages/member-edit/member-edit'
    });
  }
});

