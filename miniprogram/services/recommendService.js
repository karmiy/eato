/**
 * 推荐服务
 */
const { post } = require('./request');

/**
 * 获取餐厅推荐
 * @param {Object} params 推荐参数
 * @param {string} params.user_id 用户ID
 * @param {string[]} params.member_ids 成员ID列表
 * @param {number} params.latitude 纬度
 * @param {number} params.longitude 经度
 * @param {number} params.radius 搜索半径（米）
 * @param {number} params.budget_max 最大预算
 */
const getRecommendation = (params) => {
  return post('/recommend', params);
};

/**
 * 强制刷新推荐（忽略缓存）
 */
const refreshRecommendation = (params) => {
  return post('/recommend/refresh', params);
};

module.exports = {
  getRecommendation,
  refreshRecommendation
};

