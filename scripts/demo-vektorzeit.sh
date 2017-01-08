#!/bin/sh

$(dirname $0)/start.sh 4 5 3 $(dirname $0)/../config/graph2.dot Flugzeugabsturz &
sleep 5
tail -f $(dirname $0)/logs/out.log | tee /dev/tty | while read LOGLINE
do
   [[ "${LOGLINE}" == *"nodes believe the rumor"* ]] && pkill -P $$ tail
done