#!/bin/sh

for i in $(pgrep -f "node build/index.js")
do
    echo "Kill process $i"
    kill -9 ${i}
done