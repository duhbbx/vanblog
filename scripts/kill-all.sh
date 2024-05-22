#!/bin/bash




OS=$(uname)

if [ "$OS" == "Linux" ]; then

    echo "This is a Linux system."
    netstat -nptl  | grep 3000 | awk '{print $7}' | awk -F"/" '{print $1}' | xargs kill -9
    netstat -nptl  | grep 3001 | awk '{print $7}' | awk -F"/" '{print $1}' | xargs kill -9
    netstat -nptl  | grep 3002 | awk '{print $7}' | awk -F"/" '{print $1}' | xargs kill -9
    netstat -nptl  | grep 8360 | awk '{print $7}' | awk -F"/" '{print $1}' | xargs kill -9

elif [ "$OS" == "Darwin" ]; then
    echo "This is a macOS system."
    lsof -i :3000 | awk '{print $2}' | tail -n +2 | xargs sudo kill -9
    lsof -i :3001 | awk '{print $2}' | tail -n +2 | xargs sudo kill -9
    lsof -i :3002 | awk '{print $2}' | tail -n +2 | xargs sudo kill -9
    lsof -i :8360 | awk '{print $2}' | tail -n +2 | xargs sudo kill -9
else
    echo "Unknown operating system: $OS"
fi
