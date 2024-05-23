#!/bin/bash

# 请求google
wget https://www.google.com -o /dev/null --timeout=30

if [ $? -ne 0 ]; then
    echo "没有连接到外网哦......."
    exit 1
fi

echo "外网环境是通的..............................."

echo "设置博客地址作为环境变量.........................."
# 设置环境变量
VAN_BLOG_BUILD_SERVER="https://note.duhbb.com"

# 编译
echo "准备编译了................................"
docker build --build-arg VAN_BLOG_BUILD_SERVER=$VAN_BLOG_BUILD_SERVER \
             -t mereith/van-blog:v0.54.0-dev .                        \
             --build-arg "HTTP_PROXY=http://127.0.0.1:18118"          \
             --build-arg "HTTPS_PROXY=http://127.0.0.1:18118"         \
             --network=host

echo "导出镜像到文件了........................."
# 导出到文件
docker save -o l.tar mereith/van-blog:v0.54.0-dev


echo "上传文件到服务器.........................."
# 传到服务器
scp l.tar root@note.duhbb.com:/root/vanblog/

