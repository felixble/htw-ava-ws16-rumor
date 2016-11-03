import { Server } from './lib/server';
import { RumorServer } from './rumorServer'
import { EndpointManager } from './endpointManager'

let readLine = require('./lib/read-line');

let optionParser = require('node-getopt').create([
    ['', 'endpointFilename=[ARG]', 'path to the endpoints file'],
    ['g', 'graphFilename=[ARG]', 'path to the graph file defining the network node topology'],
    ['', 'id=[ARG]', 'ID of this endpoint'],
    ['c', 'count=[ARG]', 'number of receives until a rumor will be believed'],
    ['h', 'help', 'Display this help']
]);

let arg = optionParser.bindHelp().parseSystem();

const endpointFilename = arg.options.endpointFilename || './config/endpoints';
const graphFilename = arg.options.graphFilename || './config/graph.dot';

// TODO: STOP ALL nodes

async function main() {
    let endpointManager = new EndpointManager(endpointFilename, graphFilename);
    await endpointManager.init();
    let myId = arg.options.id || await readLine('Please insert the ID of this endpoint:');
    await endpointManager.setMyId(myId);
    console.log(endpointManager.getMyEndpoint());
    let c = arg.options.count || undefined;
    let myServer = new Server(endpointManager.getMyEndpoint().host, endpointManager.getMyEndpoint().port);
    let serverLogic = new RumorServer(myServer, endpointManager, c);
    myServer.listen(serverLogic.onReceiveData());
}

main();