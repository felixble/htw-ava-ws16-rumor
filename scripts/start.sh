#!/bin/sh

#-- Check parameters and show usage, if necessary --#

if [ $# -ne 4 ]
    then
        echo "$0 n r electionTime graphFilename"
        exit -1
fi

n=$1
r=$2
electionTime=$3
graphFileRelative=$4

#-- Convert given relative path to absolute path --#

export graphFileRelative
fileName=$(basename ${graphFileRelative})
graphFile=$(dir=$(dirname ${graphFileRelative}) ; cd ${dir} ; pwd)"/$fileName"

parent_path=$( cd "$(dirname "${BASH_SOURCE}")" ; pwd -P )
cd "$parent_path"

#-- Constants --#

INIT_PORT=4000;
LOGFILE=logs/out.log
ERR_LOGFILE=logs/err.log

rm ${LOGFILE} ${ERR_LOGFILE} 2> /dev/null

#-- Check if build files are available otherwise build project --#

if [ ! -e ../build/run-node.js ]
    then
        echo "Build files missing. Build project..."
        npm run build
fi

#-- Generate graph --#

#npm run graphgen -- -n ${n} -m ${m} -f ${graphFile}
#echo generated graph with ${n} nodes and ${m} edges

#-- Start nodes --#

for ((i=1;i<=${n};i++))
do
     npm run start -- -g ${graphFile} --id ${i} -r ${r} & #>> ${LOGFILE} 2>> ${ERR_LOGFILE} &
done

#-- Check if all nodes are started --#

#MIN_LINES=$((4 * $n + $n))
#COUNTER=0
#MAX_WAIT=900
#until [ $(cat ${LOGFILE} | wc -l) -ge ${MIN_LINES} ]; do
#    echo Not all nodes has been started... Waiting for ${COUNTER} seconds
#    sleep 5
#    COUNTER=$(($COUNTER+5))
#
#    if [ ${COUNTER} -gt ${MAX_WAIT} ]; then
#        echo Starting all nodes takes too long, exiting.
#        exit 1
#    fi
#done

#echo "All nodes has been started"

#echo "Send rumor to node 1"
#npm run init -- -c init -m "${rumor}" --host localhost --port ${INIT_PORT}

#sleep 15

#echo "\n\n" >> ${LOGFILE}

#echo "Stop all nodes"
#npm run init -- -c "stop all" --host localhost --port ${INIT_PORT}

#COUNTER=0
#MAX_WAIT=900
#until [ $(pgrep -f "node build" | wc -l) -eq 0 ]; do
#    echo Not all nodes has been stopped... Waiting for ${COUNTER} seconds
#    sleep 5
#    COUNTER=$(($COUNTER+5))
#
#    if [ ${COUNTER} -gt ${MAX_WAIT} ]; then
#        echo Stopping all nodes takes too long, exiting. You can use ./kill-all.sh to kill them all.
#        exit 1
#    fi
#done

#echo ""
#echo ""
#echo ""
#
#believers=$(cat ${LOGFILE} | grep INFO | wc -l | tr -d '[:space:]')
#
#echo ${believers} nodes believe the rumor | tee -a ${LOGFILE}
#
#exit ${believers}