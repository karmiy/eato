/**
 * API 配置
 */

// 环境配置
const ENV = {
  dev: {
    baseUrl: 'http://localhost:8000/api'
  },
  prod: {
    baseUrl: 'https://your-server.com/api'  // 以后部署时替换
  }
};

// 当前环境
const currentEnv = 'dev';

module.exports = {
  baseUrl: ENV[currentEnv].baseUrl,
  currentEnv
};

