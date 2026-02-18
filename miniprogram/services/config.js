/**
 * API 配置
 */

// 环境配置
const ENV = {
  dev: {
    baseUrl: 'http://localhost:8000/api'
  },
  // 手机预览时用这个（改成你电脑的局域网 IP）
  preview: {
    baseUrl: 'http://192.168.2.244:8000/api'
  },
  prod: {
    baseUrl: 'https://your-server.com/api'  // 以后部署时替换
  }
};

// 当前环境：dev=模拟器, preview=手机预览, prod=正式
const currentEnv = 'preview';

module.exports = {
  baseUrl: ENV[currentEnv].baseUrl,
  currentEnv
};

