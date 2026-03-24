#!/bin/bash
echo "🚀 Starting backend server..."
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "DATABASE_URL: ${DATABASE_URL:***}"

# 先测试简化版服务器
if [ "$NODE_ENV" = "test" ]; then
  echo "Running simple test server..."
  node src/server-simple.js
else
  echo "Running full server..."
  node src/index.js
fi
