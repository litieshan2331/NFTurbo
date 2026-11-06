#!/bin/bash

# 导入Docker Compose命令检测
source "$(dirname "$0")/docker-compose-helper.sh"

# 初始化Redis库存数据
echo "📦 初始化Redis库存数据..."
$DOCKER_COMPOSE_CMD exec -T redis redis-cli << 'EOF'
auth "NFTurbo666"
set "clc:inventory:10000" "99"
set "clc:inventory:10001" "100"
set "clc:inventory:10002" "100"
set "clc:inventory:10003" "100"
set "clc:inventory:10004" "96"
set "clc:inventory:10005" "100"
set "clc:inventory:10006" "100"
set "clc:inventory:10007" "100"
set "blb:inventory:22" "184"
EOF

if [ $? -eq 0 ]; then
    echo "✅ Redis库存数据初始化完成"
    
    # 验证数据是否设置成功
    echo "🔍 验证初始化数据..."
    $DOCKER_COMPOSE_CMD exec -T redis redis-cli << 'EOF'
auth "NFTurbo666"
echo "=== 库存数据验证 ==="
get "blb:inventory:22"
echo "=================="
EOF
    
    echo "=========================================="
    echo "🎉 Redis库存数据初始化成功！"
    echo "=========================================="
else
    echo "❌ Redis库存数据初始化失败"
    exit 1
fi 