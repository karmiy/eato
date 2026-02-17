/**
 * 成员状态管理
 */
const memberService = require('../services/memberService');

// 默认颜色列表
const COLORS = [
  'linear-gradient(135deg, #FF6B9D 0%, #FF9EC4 100%)',
  'linear-gradient(135deg, #6B5BFF 0%, #A89EFF 100%)',
  'linear-gradient(135deg, #34C759 0%, #7ED321 100%)',
  'linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)',
  'linear-gradient(135deg, #5AC8FA 0%, #007AFF 100%)',
  'linear-gradient(135deg, #AF52DE 0%, #FF2D55 100%)'
];

// 状态
let _state = {
  members: [],
  loading: false,
  error: null
};

// 监听者列表
let _listeners = [];

/**
 * 通知所有监听者状态变化
 */
const _notify = () => {
  _listeners.forEach(listener => listener({ ..._state }));
};

/**
 * 订阅状态变化
 * @param {Function} listener 监听函数
 * @returns {Function} 取消订阅函数
 */
const subscribe = (listener) => {
  _listeners.push(listener);
  // 立即调用一次，同步当前状态
  listener({ ..._state });
  // 返回取消订阅函数
  return () => {
    _listeners = _listeners.filter(l => l !== listener);
  };
};

/**
 * 获取当前状态
 */
const getState = () => ({ ..._state });

/**
 * 加载成员列表
 * @param {string} userId 用户ID
 */
const loadMembers = async (userId) => {
  _state.loading = true;
  _state.error = null;
  _notify();

  try {
    const members = await memberService.getMembers(userId);
    // 为每个成员添加颜色和标签（用于展示）
    _state.members = members.map((m, index) => ({
      ...m,
      color: COLORS[index % COLORS.length],
      tags: _generateTags(m)
    }));
    _state.loading = false;
    _notify();
    return _state.members;
  } catch (err) {
    _state.error = err.message;
    _state.loading = false;
    _notify();
    throw err;
  }
};

/**
 * 创建成员
 */
const createMember = async (data) => {
  const member = await memberService.createMember(data);
  const index = _state.members.length;
  const newMember = {
    ...member,
    color: COLORS[index % COLORS.length],
    tags: _generateTags(member)
  };
  _state.members = [..._state.members, newMember];
  _notify();
  return newMember;
};

/**
 * 更新成员
 */
const updateMember = async (memberId, data) => {
  const member = await memberService.updateMember(memberId, data);
  _state.members = _state.members.map(m => {
    if (m.id === memberId) {
      return { ...m, ...member, tags: _generateTags(member) };
    }
    return m;
  });
  _notify();
  return member;
};

/**
 * 删除成员
 */
const deleteMember = async (memberId) => {
  await memberService.deleteMember(memberId);
  _state.members = _state.members.filter(m => m.id !== memberId);
  _notify();
};

/**
 * 根据成员数据生成标签
 */
const _generateTags = (member) => {
  const tags = [];
  
  // 口味偏好
  if (member.taste_preferences) {
    const spicyLevel = member.taste_preferences.spicy;
    if (spicyLevel <= 1) tags.push('不辣');
    else if (spicyLevel <= 2) tags.push('微辣');
    else if (spicyLevel <= 4) tags.push('中辣');
    else tags.push('重辣');
  }
  
  // 菜系偏好（取前2个）
  if (member.cuisine_preferences?.length > 0) {
    tags.push(...member.cuisine_preferences.slice(0, 2));
  }
  
  // 饮食禁忌（取前1个）
  if (member.dietary_restrictions?.length > 0) {
    tags.push(member.dietary_restrictions[0]);
  }
  
  return tags;
};

/**
 * 根据ID获取成员
 */
const getMemberById = (memberId) => {
  return _state.members.find(m => m.id === memberId);
};

module.exports = {
  subscribe,
  getState,
  loadMembers,
  createMember,
  updateMember,
  deleteMember,
  getMemberById,
  COLORS
};

