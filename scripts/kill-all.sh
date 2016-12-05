#!/bin/sh

for i in $(pgrep -f node)
do
    echo "Kill process $i"
    kill -9 ${i}
done