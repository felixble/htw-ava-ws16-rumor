import { Server } from './lib/server';
import { Candidate } from './election/candidate'
import { Voter } from './election/voter'
import { EndpointManager } from './endpointManager'
import { CandidateIdsManager } from './election/candidateIdsManager'

let readLine = require('./lib/read-line');

/* Define parameters */
let optionParser = require('node-getopt').create([
    ['', 'endpointFilename=[ARG]', 'path to the endpoints file, leave blank to map ids to local ports'],
    ['g', 'graphFilename=[ARG]', 'path to the graph file defining the network node topology'],
    ['', 'id=[ARG]', 'ID of this endpoint'],
    ['r', 'receive=[ARG]', 'number of receives until a candidate starts a new call (e.g. campaign)'],
    ['', 'electionTime=[ARG]', 'vector time point when the election is over'],
    ['h', 'help', 'Display this help']
]);

/* Initialize parameter parser */
let arg = optionParser.bindHelp().parseSystem();

/* Set constants */
const endpointFilename = arg.options.endpointFilename || null;
const graphFilename = arg.options.graphFilename || './config/graphElection.dot';


async function main() {
    try {
        /* Initialize endpoint manager - read given config */
        let endpointManager = new EndpointManager(endpointFilename, graphFilename);
        await endpointManager.init();
        /* Set up my own id */
        let myId = parseInt(arg.options.id || await readLine('Please insert the ID of this endpoint:'));
        endpointManager.setMyId(myId);
        let r = arg.options.receive || await readLine('Please insert the number of receives:');
        let electionTime = arg.options.electionTime || undefined;
        /* initialize server */
        let myServer = new Server(endpointManager.getMyEndpoint().host, endpointManager.getMyEndpoint().port);
        /* set up server logic */
        let serverLogic =
            (CandidateIdsManager.amIACandidate(myId))
                ? new Candidate(myServer, endpointManager, r)
                : new Voter(myServer, endpointManager, electionTime);
        //let serverLogic = new RumorServer(myServer, endpointManager, r);
        /* start server and waits until server is closed */
        await myServer.listen(serverLogic.getMessageProcessor());
        console.log('exit node ' + myId);
    } catch (e) {
        if (!e.stack) console.error(e);
        else console.error(e.stack)
    }
}

main();