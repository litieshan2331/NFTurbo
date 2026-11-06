#!/bin/bash

echo "=========================================="
echo "NFTurbo 环境核心依赖（MySQL、Redis、Nacos、XXL-JOB、RocketMQ、Seata）一键启动脚本"
echo "=========================================="

# 获取公网IP地址
echo "🔍 正在获取公网IP地址..."
PUBLIC_IP=""

# 尝试多个公网IP获取服务
for service in "ifconfig.me" "icanhazip.com" "ipinfo.io/ip" "ipecho.net/plain"; do
    echo "尝试从 $service 获取IP..."
    PUBLIC_IP=$(curl -s --connect-timeout 5 --max-time 10 "$service" 2>/dev/null | tr -d '\n\r')
    if [[ -n "$PUBLIC_IP" && "$PUBLIC_IP" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "✅ 成功获取公网IP: $PUBLIC_IP"
        break
    fi
done

# 如果无法获取公网IP，让用户手动输入
if [[ -z "$PUBLIC_IP" || ! "$PUBLIC_IP" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "❌ 无法自动获取公网IP"
    echo "请手动输入您的服务器公网IP地址："
    read -p "请输入IP地址: " PUBLIC_IP
    
    # 验证IP地址格式
    while [[ ! "$PUBLIC_IP" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; do
        echo "❌ IP地址格式不正确，请重新输入："
        read -p "请输入IP地址: " PUBLIC_IP
    done
fi

echo "🎯 使用IP地址: $PUBLIC_IP"

# 替换配置文件中的占位符
echo "🔧 更新配置文件中的IP地址..."

# 替换docker-compose.yml中的占位符
sed -i.bak "s/{{PUBLIC_IP}}/$PUBLIC_IP/g" docker-compose.yml

# 替换RocketMQ broker配置中的占位符
sed -i.bak "s/{{PUBLIC_IP}}/$PUBLIC_IP/g" rocketMQ/data/broker/conf/broker.conf

# 替换MySQL初始化脚本中的占位符
sed -i.bak "s/{{PUBLIC_IP}}/$PUBLIC_IP/g" mysql/init/01-nacos-mysql.sql

echo "✅ IP地址更新完成"

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker未运行，请先启动Docker"
    exit 1
fi

echo "✅ Docker运行正常"

# 清理旧数据（可选）
read -p "是否清理旧数据？(y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "清理旧数据..."
    sudo rm -rf mysql/data/* redis/data/* es/data/*
    echo "✅ 数据清理完成"
fi

# 启动MySQL和Redis
echo "🚀 启动MySQL和Redis..."
docker compose up -d mysql redis

# 等待MySQL启动
echo "⏳ 等待MySQL启动..."
sleep 10

# 检查MySQL是否健康
echo "🔍 检查MySQL健康状态..."
for i in {1..30}; do
    if docker compose exec mysql mysqladmin ping -h localhost --silent; then
        echo "✅ MySQL启动成功"
        break
    fi
    echo "⏳ 等待MySQL启动... ($i/30)"
    sleep 10
done

# 检查Redis是否健康
echo "🔍 检查Redis健康状态..."
for i in {1..10}; do
    if docker compose exec redis redis-cli ping > /dev/null 2>&1; then
        echo "✅ Redis连接正常"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "❌ Redis连接失败，请检查Redis服务状态"
        exit 1
    fi
    echo "⏳ 等待Redis连接... ($i/10)"
    sleep 2
done

# 初始化Redis数据
echo "🔧 初始化Redis数据..."
./init-redis-data.sh

# 启动Nacos
echo "🚀 启动Nacos..."
docker compose up -d nacos

# 等待Nacos启动
echo "⏳ 等待Nacos启动..."
sleep 10

# 启动其他服务
echo "🚀 启动其他服务..."
docker compose up -d

# 等待服务启动z
echo "⏳ 等待服务启动..."
sleep 10

echo "=========================================="
echo "🎉 所有服务启动完成！"
echo "=========================================="
echo "服务访问地址："
echo "MySQL: http://ip:3306 (用户名/密码: nfturbo/NFTurbo666)"
echo "Redis: http://ip:6379 (密码: NFTurbo666)"
echo "Nacos: http://ip:8848/nacos (用户名/密码: nacos/nacos)"
echo "XXL-Job: http://ip8082/xxl-job-admin (用户名/密码: admin/123456)"
echo "RocketMQ Dashboard: http://ip:8080"
echo "=========================================="

# 显示服务状态
echo "📊 服务状态："
docker compose ps 