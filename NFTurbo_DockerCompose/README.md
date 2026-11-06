# NFTurbo 微服务基础环境

这是一个基于Docker Compose的微服务基础环境，包含了常用的中间件和工具，为NFTurbo项目提供完整的开发和生产环境支持。

## 🚀 快速开始

### 1. 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 8GB 内存
- 至少 10GB 磁盘空间
- 网络连接（用于获取公网IP）

### 2. 一键启动

```bash
# 克隆项目
git clone <your-repo-url>
cd NFTurbo_DockerCompose

# 一键启动核心服务（MySQ、Redis、Nacos、XXL-JOB、RocketMQ）
./start-core.sh
```

### 3. 手动启动

```bash
# 1. 启动MySQL和Redis
docker compose up -d mysql redis # 或者docker-compose p -d mysql redis

# 2. 等待MySQL启动后，启动Nacos
docker compose up -d nacos # 或者docker-compose up -d nacos

# 3. 初始化Redis数据
./init-redis-data.sh

# 4. 启动其他服务
docker compose up -d #或者docker-compose up -d

```

## 📊 服务列表

| 服务 | 端口 | 访问地址 | 用户名/密码 |
|------|------|----------|-------------|
| Nacos | 8848 | http://127.0.0.1:8848/nacos | nacos/nacos |
| XXL-Job | 8082 | http://127.0.0.1:8082/xxl-job-admin | admin/123456 |
| RocketMQ Dashboard | 8080 | http://127.0.0.1:8080 | - |
| Sentinel Dashboard | 8888 | http://127.0.0.1:8888 | sentinel/sentinel |
| Kibana | 5601 | http://127.0.0.1:5601 | test/123456 |
| Elasticsearch | 9200 | http://127.0.0.1:9200 | elastic/123456 |
| MySQL | 3306 | - | nfturbp/NFTurbo666 |
| Redis | 6379 | - | NFTurbo666 |
| Seata Server | 8091 | - | - |
| RocketMQ Namesrv | 9876 | - | - |
| RocketMQ Broker | 10909,10911,10912 | - | - |

## 🔧 配置说明

### 数据库自动初始化

项目已配置数据库自动初始化，MySQL容器启动时会自动执行以下脚本：

- `mysql/init/01-nacos-mysql.sql` - Nacos数据库和表结构
- `mysql/init/02-xxl-job.sql` - XXL-Job数据库和表结构  
- `mysql/init/03-seata-server.sql` - Seata数据库和表结构
- `mysql/init/04-nfturbo.sql` - NFTurbo项目数据库和表结构

### IP地址自动配置

`start-core.sh` 脚本会自动：
1. 获取服务器公网IP地址
2. 更新所有配置文件中的IP占位符
3. 启动所有服务

### Redis数据初始化

`init-redis-data.sh` 脚本会自动初始化Redis中的库存数据：
- 设置商品库存信息
- 验证数据初始化结果

### Nacos配置

Nacos会自动创建以下配置：

- 命名空间：`seata-server`
- 配置项：`seataServer.properties` (SEATA_GROUP)

## 📁 目录结构

```
NFTurbo_DockerCompose/
├── docker-compose.yml          # Docker Compose配置
├── start-core.sh              # 一键启动脚本
├── init-redis-data.sh         # Redis数据初始化脚本
├── docker-compose-helper.sh   # Docker Compose命令检测脚本
├── mysql/
│   ├── config/                # MySQL配置
│   ├── data/                  # MySQL数据
│   ├── logs/                  # MySQL日志
│   └── init/                  # 数据库初始化脚本
├── redis/
│   ├── config/                # Redis配置
│   └── data/                  # Redis数据
├── nacos/
│   ├── env/                   # Nacos环境配置
│   └── logs/                  # Nacos日志
├── rocketMQ/
│   └── data/                  # RocketMQ数据
├── xxl-job/
│   └── config/                # XXL-Job配置
├── es/
│   ├── config/                # Elasticsearch配置
│   └── data/                  # Elasticsearch数据
├── kibana/
│   └── conf/                  # Kibana配置
├── seata-server/
│   ├── resources/             # Seata配置
│   └── logs/                  # Seata日志
└── sentinel/
    ├── Dockerfile             # Sentinel镜像构建
    ├── entrypoint.sh          # Sentinel启动脚本
    └── build.sh               # Sentinel构建脚本
```

## 🛠️ 常用命令

```bash
# 查看服务状态
docker compose ps

# 查看服务日志
docker compose logs [service-name] # 或者docker-compose logs [service-name]

# 重启服务
docker compose restart [service-name] #或者docker-compose restart [service-name]

# 停止所有服务
docker compose down #或者docker-compose down

# 初始化Redis数据
./init-redis-data.sh
```

## 🔍 故障排查

### 1. 服务启动失败

检查Docker和Docker Compose版本：
```bash
docker --version
docker compose version
```

### 2. 数据库连接失败

检查MySQL是否正常启动：
```bash
docker compose logs mysql
```

### 3. Nacos配置问题

检查Nacos日志：
```bash
docker compose logs nacos
```

### 4. 端口冲突

检查端口占用：
```bash
lsof -i :8848
lsof -i :8082
lsof -i :8080
```

### 5. IP地址问题

如果服务无法正常通信，检查IP地址配置：
```bash
# 查看当前使用的IP地址
curl -s ifconfig.me
```

## 📝 注意事项

1. 首次启动需要下载镜像，请确保网络连接正常
2. 建议使用国内Docker镜像源加速下载
3. 生产环境请修改默认密码
4. 定期备份重要数据
5. 监控服务资源使用情况
6. 确保服务器有公网IP，否则需要手动配置内网IP
7. Redis密码为 `NFTurbo666`，MySQL密码为 `NFTurbo666`

## 🔐 安全配置

### 默认密码

- MySQL: `root/NFTurbo666`
- Redis: `NFTurbo666`
- Nacos: `nacos/nacos`
- XXL-Job: `admin/123456`
- Elasticsearch: `elastic/123456`
- Kibana: `test/123456`


