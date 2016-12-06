import { Server } from './lib/server';
import { RumorServer } from './rumorServer'
import { EndpointManager } from './endpointManager'

let readLine = require('./lib/read-line');

/* Define parameters */
let optionParser = require('node-getopt').create([
    ['', 'endpointFilename=[ARG]', 'path to the endpoints file, leave blank to map ids to local ports'],
    ['g', 'graphFilename=[ARG]', 'path to the graph file defining the network node topology'],
    ['', 'id=[ARG]', 'ID of this endpoint'],
    ['c', 'count=[ARG]', 'number of receives until a rumor will be believed'],
    ['h', 'help', 'Display this help']
]);

/* Initialize parameter parser */
let arg = optionParser.bindHelp().parseSystem();

/* Set constants */
const endpointFilename = arg.options.endpointFilename || null;
const graphFilename = arg.options.graphFilename || './config/graph.dot';


async function main() {
    try {
        /* Initialize endpoint manager - read given config */
        let endpointManager = new EndpointManager(endpointFilename, graphFilename);
        await endpointManager.init();
        /* Set up my own id */
        let myId = parseInt(arg.options.id || await readLine('Please insert the ID of this endpoint:'));
        endpointManager.setMyId(myId);
        console.log(endpointManager.getMyEndpoint());
        let c = arg.options.count || undefined;
        /* initialize server */
        let myServer = new Server(endpointManager.getMyEndpoint().host, endpointManager.getMyEndpoint().port);
        /* set up server logic */
        let serverLogic = new RumorServer(myServer, endpointManager, c);
        /* start server and wait until server is closed */
        await myServer.listen(serverLogic.onReceiveData());
        console.log('exit node ' + myId);
    } catch (e) {
        if (!e.stack) console.error(e);
        else console.error(e.stack)
    }
}

main();