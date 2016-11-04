#!/bin/sh

if [ $# -ne 4 ]
    then
        echo "$0 n m c graphFilename"
        exit -1
fi

n=$1
m=$2
c=$3
graphFile=$4

if [ $n -gt 20 ]
    then
        echo "Please add more endpoints to ./config/endpoints"
        exit -1
fi

npm run graphgen -- -n $n -m $m -f $graphFile
echo generated graph with $n nodes and $m edges

rm output.txt

for ((i=1;i<=$n;i++))
do
     npm run start -- --endpointFilename ./config/endpoints -g $graphFile --id $i -c $c >> output.txt &
done

MINLINES=$((4 * $n + $n))
COUNTER=0
MAX_WAIT=900
until [ $(cat output.txt | wc -l) -ge $MINLINES ]; do
    echo Not all nodes has been started... Waiting for $COUNTER seconds
    sleep 5
    COUNTER=$(($COUNTER+5))

    if [ $COUNTER -gt $MAX_WAIT ]; then
        echo Starting all nodes takes too long, exiting. Log:
        cat server.log
        exit 1
    fi
done

echo "All nodes has been started"

echo "Send rumor to node 1"
npm run init -- -c init -r "this is the rumor" --host localhost --port 6000

sleep 10

echo "\n\n" >> output.txt

echo "Stop all nodes"
npm run init -- -c "stop all" --host localhost --port 6000

echo ""
echo ""
echo ""

believers=$(cat output.txt | grep INFO | wc -l | tr -d '[:space:]')

echo $believers nodes believe the rumor

exit $believers