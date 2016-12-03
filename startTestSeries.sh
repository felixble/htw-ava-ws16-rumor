#!/bin/sh

file=config/testSeries
out=testSeries.log

rm ${out}

series=$(cat config/testSeries)

cat ${file} | while read line
do
    i=0
    for x in ${line}
    do
        case ${i} in
            "0")
                n=$x
                ;;
            "1")
                m=$x
                ;;
            "2")
                c=$x
                ;;
            "3")
                rumor=$x
                ;;
        esac
        i=$((i+1))
    done
    ./start.sh ${n} ${m} ${c} config/graph2.dot ${rumor}
    echo "./start.sh ${n} ${m} ${c} config/graph2.dot ${rumor}"
    echo ${n} ${m} ${c} ${rumor} $? >> ${out}
    echo $?
done