#!/bin/sh

for i in $(pgrep -f "node build/run-node.js")
do
    echo "Kill process $i"
    kill -9 ${i}
done