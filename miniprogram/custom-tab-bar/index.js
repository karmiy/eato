/**
 * Eato - 自定义 TabBar 组件
 */
Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: '/pages/home/home',
        text: '吃哪家'
      },
      {
        pagePath: '/pages/menu/menu',
        text: '点什么菜'
      },
      {
        pagePath: '/pages/profile/profile',
        text: '我的'
      }
    ]
  },

  methods: {
    switchTab(e) {
      const { path, index } = e.currentTarget.dataset;
      
      if (this.data.selected === index) return;
      
      wx.switchTab({
        url: path,
        success: () => {
          this.setData({ selected: index });
        }
      });
    },

    // 供页面调用，设置当前选中
    setSelected(index) {
      this.setData({ selected: index });
    }
  }
});

