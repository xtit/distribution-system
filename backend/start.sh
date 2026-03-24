#!/bin/bash
echo "🚀 Starting backend server..."
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "DATABASE_URL: ${DATABASE_URL:***}"
node src/index.js
