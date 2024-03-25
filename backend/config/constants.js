const path = require('path');
const dotEnv = require('dotenv');

const parsedEnv = dotEnv.config({
  path: path.join(__dirname, '../.env'),
});

if (parsedEnv.error) {
    throw parsedEnv.error;
  }
  
  const config = {
    PORT: Number(process.env.PORT) || 8081,
    wss_PORT: Number(process.env.wss_PORT) || 8080,
    maxReconnectAttempts: Number(process.env.maxReconnectAttempts) || 5,
    wss_URL: process.env.wss_URL || 'ws://localhost:8082/v1/stream'
  };

  module.exports = config;