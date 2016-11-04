for ((i=1;i<=5;i++))
do
     npm run start -- --endpointFilename ./config/endpoints -g ./config/graph2.dot --id $i -c 2 &
done