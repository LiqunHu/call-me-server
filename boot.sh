#!/bin/bash
docker kill testpostgres testredis
docker rm testpostgres testredis 
docker run --rm -p 127.0.0.1:6379:6379 --name testredis -v $PWD/redis-data:/data -d redis:8 redis-server --appendonly yes --requirepass 123456
docker run --rm -p 127.0.0.1:15432:5432 --name testpostgres -v $PWD/postgresql:/var/lib/postgresql -e TZ=Asia/Shanghai -e POSTGRES_PASSWORD=123456 -d postgres:18