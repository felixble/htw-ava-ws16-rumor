import { SpawnElectionNodes } from './process-helpers/spawn-election-nodes';

let sleep = require('./lib/sleep');
let exec = require('child-process-promise').exec;

/* Define parameters */
let optionParser = require('node-getopt').create([
    ['n', 'nodes=[ARG]', 'number of nodes (without the observer node)'],
    ['s', 'supporters=[ARG]', 'number of supporters per candidate'],
    ['f', 'friends=[ARG]', 'number of friends for each voter'],
    ['r', 'receives=[ARG]', 'number of receives until a candidate starts a new call (e.g. campaign)'],
    ['g', 'graphFilename=[ARG]', 'path to the graph file defining the network node topology'],
    ['d', 'delay=[ARG]', 'delay between initiating the election process and taking the snapshot (in seconds)'],
    ['h', 'help', 'Display this help']
]);

/* Initialize parameter parser */
let arg = optionParser.bindHelp().parseSystem();

let resolveElection = null;

async function main() {
    try {
        let numberOfNodes = arg.options.nodes || 8,
            numberOfSupporters = arg.options.supporters || 2,
            numberOfFriends = arg.options.friends || 3,
            numberOfReceives = arg.options.receives || 3,
            graphFile = arg.options.graphFilename || './config/graphElection.dot',
            delay = parseInt(arg.options.delay, 10) || 1;

        await generateGraph(numberOfNodes, numberOfSupporters, numberOfFriends, graphFile);

        let spawnElectionNodes = new SpawnElectionNodes(numberOfNodes, numberOfReceives, graphFile);
        spawnElectionNodes.setFinishedElectionCallback(onElectionFinished);
        await spawnElectionNodes.spawn();
        console.log('stated all election nodes');
        await spawnElectionNodes.spawnObserver();

        await initElectionProcess();
        console.log('started election process');

        await sleep(delay * 1000);

        await takeSnapshot();
        await stopAll();
    } catch (e) {
        if (!e.stack) console.error(e);
        else console.error(e.stack)
    }
}

async function generateGraph(numberOfNodes, numberOfSupporters, numberOfFriends, graphFile) {
    await execErrStdout('npm run graphgen -- '
        + `-n ${numberOfNodes} -s ${numberOfSupporters} -f ${numberOfFriends} -o ${graphFile}`);
}

async function initElectionProcess() {
    await execErrStdout('npm run init -- -c msg -t init --addresses "localhost:4001;localhost:4002" -m "empty"');
}

async function takeSnapshot() {
    return new Promise(async (resolve, reject) => {
        resolveElection = resolve;
        try {
            await execErrStdout('npm run init -- -c msg -t take-snapshot --addresses localhost:4000 -m "empty"');
        } catch (e) {
            reject(e);
        }
    });
}

async function stopAll() {
    await execErrStdout('npm run init -- -c "stop all" --addresses "localhost:4001;localhost:4002"')
}

async function execErrStdout(cmd) {
    let result = await exec(cmd);
    console.error(result.stderr);
}

function onElectionFinished(result) {
    console.log(result);
    resolveElection();
}

main();