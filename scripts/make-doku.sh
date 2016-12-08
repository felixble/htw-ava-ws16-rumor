#!/bin/bash

parent_path=$( cd "$(dirname "${BASH_SOURCE}")" ; pwd -P )
cd "$parent_path"

cat ../README.md | tee >(pandoc -o ../README.html) | sed 's/svg/png/g' \
            | pandoc -V geometry:margin=1in -t latex -s -o ../README.pdf