/**
 * 成员相关 API
 */
const { get, post, put, del } = require('./request');

/**
 * 获取成员列表
 * @param {string} userId 用户ID
 */
const getMembers = (userId) => {
  return get(`/members/${userId}`);
};

/**
 * 获取单个成员
 * @param {string} memberId 成员ID
 */
const getMember = (memberId) => {
  return get(`/members/detail/${memberId}`);
};

/**
 * 创建成员
 * @param {Object} data 成员数据
 */
const createMember = (data) => {
  return post('/members', data);
};

/**
 * 更新成员
 * @param {string} memberId 成员ID
 * @param {Object} data 更新数据
 */
const updateMember = (memberId, data) => {
  return put(`/members/${memberId}`, data);
};

/**
 * 删除成员
 * @param {string} memberId 成员ID
 */
const deleteMember = (memberId) => {
  return del(`/members/${memberId}`);
};

module.exports = {
  getMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember
};

