import { Server } from './lib/server';
import { HelloServer } from './helloServer'
import { EndpointManager } from './endpointManager'

let readLine = require('./lib/read-line');

const endpointFilename = './config/endpoints';
const graphFilename = './config/graph.dot';


async function main() {
    let endpointManager = new EndpointManager(endpointFilename, graphFilename);
    await endpointManager.init();
    let myId = await readLine('Please insert the ID of this endpoint:');
    await endpointManager.setMyId(myId);
    console.log(endpointManager.getMyEndpoint());
    let myServer = new Server(endpointManager.getMyEndpoint().host, endpointManager.getMyEndpoint().port);
    let serverLogic = new HelloServer(myServer, endpointManager);
    myServer.listen(serverLogic.onReceiveData());
}

main();