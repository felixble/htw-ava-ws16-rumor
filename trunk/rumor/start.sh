#!/bin/sh

if [ $# -ne 5 ]
    then
        echo "$0 n m c graphFilename rumor"
        exit -1
fi

n=$1
m=$2
c=$3
graphFile=$4
rumor=$4

INIT_PORT=4000;
LOGFILE=out.log
ERR_LOGFILE=err.log

rm ${LOGFILE} ${ERR_LOGFILE}

#npm run build

npm run graphgen -- -n ${n} -m ${m} -f ${graphFile}
echo generated graph with ${n} nodes and ${m} edges

for ((i=1;i<=$n;i++))
do
     npm run start -- -g ${graphFile} --id ${i} -c ${c} >> ${LOGFILE} 2>> ${ERR_LOGFILE} &
done

MIN_LINES=$((4 * $n + $n))
COUNTER=0
MAX_WAIT=900
until [ $(cat ${LOGFILE} | wc -l) -ge ${MIN_LINES} ]; do
    echo Not all nodes has been started... Waiting for ${COUNTER} seconds
    sleep 5
    COUNTER=$(($COUNTER+5))

    if [ ${COUNTER} -gt ${MAX_WAIT} ]; then
        echo Starting all nodes takes too long, exiting.
        exit 1
    fi
done

echo "All nodes has been started"

echo "Send rumor to node 1"
npm run init -- -c init -r ${rumor} --host localhost --port ${INIT_PORT}

sleep 20

echo "\n\n" >> ${LOGFILE}

echo "Stop all nodes"
npm run init -- -c "stop all" --host localhost --port ${INIT_PORT}

echo ""
echo ""
echo ""

believers=$(cat ${LOGFILE} | grep INFO | wc -l | tr -d '[:space:]')

echo ${believers} nodes believe the rumor

exit ${believers}