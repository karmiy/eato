/**
 * Eato - 菜单扫描页面
 */
Page({
  data: {
    images: [],
    peopleCount: 2,
    budget: '',
    selectedMembers: []
  },

  onLoad(options) {
    if (options.images) {
      try {
        const images = JSON.parse(decodeURIComponent(options.images));
        this.setData({ images });
      } catch (e) {
        console.error('解析图片参数失败', e);
      }
    }
  },

  // 删除图片
  removeImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images.filter((_, i) => i !== index);
    this.setData({ images });
    
    if (images.length === 0) {
      wx.navigateBack();
    }
  },

  // 添加更多图片
  addMoreImages() {
    wx.chooseMedia({
      count: 5 - this.data.images.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFiles.map(file => file.tempFilePath);
        this.setData({
          images: [...this.data.images, ...newImages]
        });
      }
    });
  },

  // 增加人数
  increasePeople() {
    if (this.data.peopleCount < 20) {
      this.setData({ peopleCount: this.data.peopleCount + 1 });
    }
  },

  // 减少人数
  decreasePeople() {
    if (this.data.peopleCount > 1) {
      this.setData({ peopleCount: this.data.peopleCount - 1 });
    }
  },

  // 预算变化
  onBudgetChange(e) {
    this.setData({ budget: e.detail.value });
  },

  // 选择成员
  selectMembers() {
    wx.navigateTo({
      url: '/pages/members/members?mode=select&selected=' + 
        encodeURIComponent(JSON.stringify(this.data.selectedMembers.map(m => m.id)))
    });
  },

  // 开始推荐
  startRecommend() {
    if (this.data.images.length === 0) {
      wx.showToast({ title: '请先上传菜单图片', icon: 'none' });
      return;
    }

    wx.showLoading({ title: 'AI 识别中...' });

    // TODO: 上传图片并调用 OCR API
    setTimeout(() => {
      wx.hideLoading();
      wx.navigateTo({
        url: '/pages/menu-result/menu-result'
      });
    }, 2000);
  }
});

