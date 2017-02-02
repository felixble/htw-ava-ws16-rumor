#!/bin/sh
ABSOLUTE_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

npm run start-election -- -n 30 -s 3 -f 5 -r 5 2> ${ABSOLUTE_PATH}/../log/err.log | tee ${ABSOLUTE_PATH}/../log/out.log
