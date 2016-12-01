import { Server } from './lib/server';
import { RumorServer } from './rumorServer'
import { EndpointManager } from './endpointManager'

let readLine = require('./lib/read-line');

let optionParser = require('node-getopt').create([
    ['', 'endpointFilename=[ARG]', 'path to the endpoints file, leave blank to map ids to local ports'],
    ['g', 'graphFilename=[ARG]', 'path to the graph file defining the network node topology'],
    ['', 'id=[ARG]', 'ID of this endpoint'],
    ['c', 'count=[ARG]', 'number of receives until a rumor will be believed'],
    ['h', 'help', 'Display this help']
]);

let arg = optionParser.bindHelp().parseSystem();

const endpointFilename = arg.options.endpointFilename || null;
const graphFilename = arg.options.graphFilename || './config/graph.dot';


async function main() {
    try {
        let endpointManager = new EndpointManager(endpointFilename, graphFilename);
        await endpointManager.init();
        let myId = parseInt(arg.options.id || await readLine('Please insert the ID of this endpoint:'));
        await endpointManager.setMyId(myId);
        console.log(endpointManager.getMyEndpoint());
        let c = arg.options.count || undefined;
        let myServer = new Server(endpointManager.getMyEndpoint().host, endpointManager.getMyEndpoint().port);
        let serverLogic = new RumorServer(myServer, endpointManager, c);
        await myServer.listen(serverLogic.onReceiveData());
        console.log('exit node ' + myId);
    } catch (e) {
        if (!e.stack) console.error(e);
        else console.error(e.stack)
    }
}

main();