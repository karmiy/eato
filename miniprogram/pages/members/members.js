/**
 * Eato - 吃货档案页面
 */
Page({
  data: {
    isSelectMode: false,
    selectedIds: [],
    members: [
      {
        id: '1',
        name: '我',
        color: 'linear-gradient(135deg, #FF6B9D 0%, #FF9EC4 100%)',
        tags: ['微辣', '川菜', '不吃香菜']
      },
      {
        id: '2',
        name: '老婆',
        color: 'linear-gradient(135deg, #6B5BFF 0%, #A89EFF 100%)',
        tags: ['不辣', '粤菜', '海鲜过敏']
      },
      {
        id: '3',
        name: '宝宝',
        color: 'linear-gradient(135deg, #34C759 0%, #7ED321 100%)',
        tags: ['不辣', '清淡', '无坚果']
      }
    ]
  },

  onLoad(options) {
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

