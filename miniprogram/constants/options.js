/**
 * 共享选项常量
 * 基于美团、饿了么等主流外卖平台的分类整理
 */

// 菜系列表（按外卖平台常见分类整理）
const CUISINE_OPTIONS = [
  // === 中餐·八大菜系 ===
  { value: '川菜', label: '川菜', emoji: '🌶️', group: '中餐' },
  { value: '粤菜', label: '粤菜', emoji: '🥢', group: '中餐' },
  { value: '湘菜', label: '湘菜', emoji: '🔥', group: '中餐' },
  { value: '江浙菜', label: '江浙菜', emoji: '🥬', group: '中餐' },
  { value: '闽菜', label: '闽菜', emoji: '🦐', group: '中餐' },
  { value: '鲁菜', label: '鲁菜', emoji: '🧅', group: '中餐' },
  { value: '徽菜', label: '徽菜', emoji: '🍲', group: '中餐' },

  // === 中餐·地方菜 ===
  { value: '东北菜', label: '东北菜', emoji: '🥟', group: '中餐' },
  { value: '西北菜', label: '西北菜', emoji: '🍜', group: '中餐' },
  { value: '云南菜', label: '云南菜', emoji: '🍄', group: '中餐' },
  { value: '贵州菜', label: '贵州菜', emoji: '🫕', group: '中餐' },
  { value: '新疆菜', label: '新疆菜', emoji: '🐑', group: '中餐' },
  { value: '客家菜', label: '客家菜', emoji: '🥘', group: '中餐' },
  { value: '潮汕菜', label: '潮汕菜', emoji: '🦪', group: '中餐' },

  // === 火锅烧烤 ===
  { value: '火锅', label: '火锅', emoji: '🫕', group: '火锅烧烤' },
  { value: '烧烤', label: '烧烤', emoji: '🍖', group: '火锅烧烤' },
  { value: '串串香', label: '串串香', emoji: '🍢', group: '火锅烧烤' },
  { value: '烤鱼', label: '烤鱼', emoji: '🐟', group: '火锅烧烤' },
  { value: '小龙虾', label: '小龙虾', emoji: '🦞', group: '火锅烧烤' },

  // === 小吃快餐 ===
  { value: '小吃', label: '小吃', emoji: '🥟', group: '小吃快餐' },
  { value: '快餐', label: '快餐', emoji: '🍱', group: '小吃快餐' },
  { value: '面食', label: '面食', emoji: '🍜', group: '小吃快餐' },
  { value: '米粉', label: '米粉', emoji: '🍚', group: '小吃快餐' },
  { value: '粥店', label: '粥店', emoji: '🥣', group: '小吃快餐' },
  { value: '饺子馄饨', label: '饺子馄饨', emoji: '🥟', group: '小吃快餐' },
  { value: '黄焖鸡', label: '黄焖鸡', emoji: '🍗', group: '小吃快餐' },
  { value: '麻辣烫', label: '麻辣烫', emoji: '🍲', group: '小吃快餐' },

  // === 异国料理 ===
  { value: '日料', label: '日料', emoji: '🍣', group: '异国料理' },
  { value: '韩餐', label: '韩餐', emoji: '🥓', group: '异国料理' },
  { value: '西餐', label: '西餐', emoji: '🍝', group: '异国料理' },
  { value: '东南亚菜', label: '东南亚菜', emoji: '🥥', group: '异国料理' },
  { value: '泰餐', label: '泰餐', emoji: '🌴', group: '异国料理' },
  { value: '越南菜', label: '越南菜', emoji: '🥖', group: '异国料理' },
  { value: '印度菜', label: '印度菜', emoji: '🫓', group: '异国料理' },

  // === 其他 ===
  { value: '自助餐', label: '自助餐', emoji: '🍽️', group: '其他' },
  { value: '海鲜', label: '海鲜', emoji: '🦀', group: '其他' },
  { value: '素食', label: '素食', emoji: '🥬', group: '其他' },
  { value: '轻食沙拉', label: '轻食沙拉', emoji: '🥗', group: '其他' },
  { value: '甜品饮品', label: '甜品饮品', emoji: '🧋', group: '其他' },
  { value: '西式快餐', label: '西式快餐', emoji: '🍔', group: '其他' },
  { value: '咖啡厅', label: '咖啡厅', emoji: '☕', group: '其他' },
  { value: '面包烘焙', label: '面包烘焙', emoji: '🥐', group: '其他' }
];

// 饮食禁忌
const RESTRICTION_OPTIONS = [
  // 过敏类
  { value: '海鲜过敏', label: '海鲜过敏' },
  { value: '坚果过敏', label: '坚果过敏' },
  { value: '花生过敏', label: '花生过敏' },
  { value: '鸡蛋过敏', label: '鸡蛋过敏' },
  { value: '牛奶过敏', label: '牛奶过敏' },
  // 不吃类
  { value: '不吃辣', label: '不吃辣' },
  { value: '不吃香菜', label: '不吃香菜' },
  { value: '不吃葱', label: '不吃葱' },
  { value: '不吃蒜', label: '不吃蒜' },
  { value: '不吃内脏', label: '不吃内脏' },
  { value: '不吃肥肉', label: '不吃肥肉' },
  { value: '不吃羊肉', label: '不吃羊肉' },
  { value: '不吃牛肉', label: '不吃牛肉' },
  // 特殊饮食
  { value: '素食', label: '素食' },
  { value: '清真', label: '清真' },
  { value: '低糖饮食', label: '低糖饮食' },
  { value: '低盐饮食', label: '低盐饮食' }
];

// 距离选项
const DISTANCE_OPTIONS = [
  { value: 1, label: '1km内' },
  { value: 3, label: '3km内' },
  { value: 5, label: '5km内' },
  { value: 10, label: '10km内' }
];

// 预算选项
const BUDGET_OPTIONS = [
  { value: null, label: '不限', max: null },
  { value: 30, label: '30元以下', max: 30 },
  { value: 60, label: '30-60元', max: 60 },
  { value: 100, label: '60-100元', max: 100 },
  { value: 200, label: '100元以上', max: 200 }
];

module.exports = {
  CUISINE_OPTIONS,
  RESTRICTION_OPTIONS,
  DISTANCE_OPTIONS,
  BUDGET_OPTIONS
};

