#!/bin/sh

ABSOLUTE_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cat ${ABSOLUTE_PATH}/../log/out.log | grep "(0)"