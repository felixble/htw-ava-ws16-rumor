import { Server } from '../lib/server';
import { ObserverNode } from '../election/observerNode';

const MY_ENDPOINT = {
    id: 0,
    host: 'localhost',
    port: 3999
};

let endpointManager = {
    getMyEndpoint: function () {
        return MY_ENDPOINT;
    },
    getMyNeighbors: function() {
        return [];
    },
    getMyId: function() {
        return '0';
    }
};

async function main() {
    try {
        /* initialize server */
        let myServer = new Server('localhost', 3999);
        /* set up server logic */
        let serverLogic = new ObserverNode(myServer, endpointManager);
        /* start server and wait until server is closed */
        await myServer.listen(serverLogic.getMessageProcessor());
        console.log('exit observer node');
    } catch (e) {
        if (!e.stack) console.error(e);
        else console.error(e.stack);
    }
}

main();