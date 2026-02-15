/**
 * Eato - 用餐记录页面
 */
Page({
  data: {
    records: [],
    groupedRecords: []
  },

  onLoad() {
    this.loadRecords();
  },

  loadRecords() {
    // 模拟数据
    const records = [
      {
        id: '1',
        restaurantName: '川味小馆',
        date: '2024-01-15',
        time: '12:30',
        peopleCount: 3,
        totalPrice: 186,
        rating: 5,
        dishes: '水煮鱼、宫保鸡丁、蒜蓉西兰花、米饭x3'
      },
      {
        id: '2',
        restaurantName: '粤式茶餐厅',
        date: '2024-01-15',
        time: '19:00',
        peopleCount: 2,
        totalPrice: 158,
        rating: 4,
        dishes: '叉烧饭、云吞面、港式奶茶x2'
      },
      {
        id: '3',
        restaurantName: '日式拉面馆',
        date: '2024-01-14',
        time: '12:00',
        peopleCount: 1,
        totalPrice: 48,
        rating: 4,
        dishes: '豚骨拉面'
      }
    ];

    // 按日期分组
    const grouped = {};
    records.forEach(record => {
      const dateStr = this.formatDate(record.date);
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(record);
    });

    const groupedRecords = Object.keys(grouped).map(date => ({
      date,
      records: grouped[date]
    }));

    this.setData({ records, groupedRecords });
  },

  formatDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return '今天';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return '昨天';
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  }
});

