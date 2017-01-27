import { SpawnElectionNodes } from './process-helpers/spawn-election-nodes';

let exec = require('child-process-promise').exec;
let spawn = require('child-process-promise').spawn;

/* Define parameters */
let optionParser = require('node-getopt').create([
    ['n', 'nodes=[ARG]', 'number of nodes (without the observer node)'],
    ['s', 'supporters=[ARG]', 'number of supporters per candidate'],
    ['f', 'friends=[ARG]', 'number of friends for each voter'],
    ['r', 'receives=[ARG]', 'number of receives until a candidate starts a new call (e.g. campaign)'],
    ['g', 'graphFilename=[ARG]', 'path to the graph file defining the network node topology'],
    ['h', 'help', 'Display this help']
]);

/* Initialize parameter parser */
let arg = optionParser.bindHelp().parseSystem();


async function main() {
    let numberOfNodes = arg.options.nodes || 8,
        numberOfSupporters = arg.options.supporters || 2,
        numberOfFriends = arg.options.friends || 3,
        numberOfReceives = arg.options.receives || 3,
        graphFile = arg.options.graphFilename || './config/graphElection.dot';

    await generateGraph(numberOfNodes, numberOfSupporters, numberOfFriends, graphFile);

    let spawnElectionNodes = new SpawnElectionNodes(numberOfNodes, numberOfReceives, graphFile);
    await spawnElectionNodes.spawn();
    //await spawnElectionNodes.spawnObserver();


}

async function generateGraph(numberOfNodes, numberOfSupporters, numberOfFriends, graphFile) {
    try {
        let result = await exec('npm run graphgen -- '
            + `-n ${numberOfNodes} -s ${numberOfSupporters} -f ${numberOfFriends} -o ${graphFile}`);
        console.log(result.stdout);
        console.error(result.stderr);
    } catch (e) {
        console.error(e);
    }
}


main();