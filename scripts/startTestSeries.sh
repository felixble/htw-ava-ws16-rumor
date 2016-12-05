#!/bin/sh

#-- Check parameters & convert relative path to absolute path --#

if [ $# -eq 1 ]
    then
        export file
        file_relative=$1
        export file_relative
        fileName=$(basename ${file_relative})
        file=$(dir=$(dirname ${file_relative}) ; cd ${dir} ; pwd)"/$fileName"
fi

#-- Set script directory as working directory --#

parent_path=$( cd "$(dirname "${BASH_SOURCE}")" ; pwd -P )
cd "$parent_path"

#-- Set default parameter if no parameters given --#

if [ -z ${file+x} ]
    then
        file=../config/testSeries
fi

#-- Constants --#

DATE=`date +%Y-%m-%d:%H:%M:%S`

file=../config/testSeries
graphFile=config/graph2.dot
log=logs/testSeries.log
out=results/testSeriesResult_${DATE}.log

rm ${out} ${log} 2> /dev/null

#-- Functions --#

# Zeigt einen Fortschrittsbalken an
# 1. Parameter aktuell erreichter Wert
# 2. Parameter max. erreichbarer Wert
show_progress() {
    current=$1
    max=$2
    p=$((current*100/max))
    bar_max=50
    bar=""
    for (( c=0; c <= ${bar_max}; ++c ))
    do
        if [ ${c} -le $((p/2)) ]
            then
                char="#"
            else
                char=" "
        fi
        bar=${bar}${char}
    done
    printf "${bar}  (${p}%%)\r"
}

#-- Code --#

series=$(cat ${file})

runs=$(cat ${file} | wc -l)

estimatedRunTime=30
estimatedDuration=$((estimatedRunTime*runs))
echo Starting test series with ${runs} tests.
echo Each test will take about ${estimatedRunTime} seconds.
echo So the whole series will take about $(($estimatedDuration / 60)) minutes and $(($estimatedDuration % 60)) seconds.

SECONDS=0

run=0
show_progress ${run} ${runs}
cat ${file} | while read line   # iterate over lines
do
    i=0
    for x in ${line}
    do
        case ${i} in            # parse each line
            "0")
                n=${x}
                ;;
            "1")
                m=${x}
                ;;
            "2")
                c=${x}
                ;;
            "3")
                rumor=${x}
                ;;
        esac
        i=$((i+1))
    done
    echo "execute ./start.sh ${n} ${m} ${c} ${graphFile} ${rumor}" >> ${log}
    ./start.sh ${n} ${m} ${c} ${graphFile} ${rumor} >> ${log}
    res=$?
    echo ${n} ${m} ${c} ${rumor} ${res} >> ${out}

    run=$((run+1))
    show_progress ${run} ${runs}
done

echo

duration=$SECONDS

echo "Execution time: $(($duration / 60)) minutes and $(($duration % 60)) seconds"