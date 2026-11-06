#!/bin/bash

# Docker Compose命令检测和选择函数
# 优先使用 docker compose，如果不存在则使用 docker-compose
get_docker_compose_cmd() {
    if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
        echo "docker compose"
    elif command -v docker-compose >/dev/null 2>&1; then
        echo "docker-compose"
    else
        echo "错误: 未找到 docker compose 或 docker-compose 命令" >&2
        exit 1
    fi
}

# 获取Docker Compose命令
DOCKER_COMPOSE_CMD=$(get_docker_compose_cmd)

# 导出变量供其他脚本使用
export DOCKER_COMPOSE_CMD 