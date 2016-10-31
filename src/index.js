import { Server } from './lib/server';
import { Client } from './lib/client';
import { EndpointManager } from './endpointManager'

let readLine = require('./lib/read-line');

const endpointFilename = './config/endpoints';
const graphFilename = './config/graph.dot';

function log(type, msg) {
    let date = new Date();
    console.log(`${type} (${date}): ${msg}`);
}

function logR(msg) {
    log('RECEIVE', msg);
}

function logS(msg, node) {
    let nodeStr = JSON.stringify(node);
    log('SEND   ', `${msg} to ${nodeStr}`);
}

async function main() {
    let endpointManager = new EndpointManager(endpointFilename, graphFilename);
    await endpointManager.init();
    let myId = await readLine('Please insert the ID of this endpoint:');
    await endpointManager.setMyId(myId);
    console.log(endpointManager.getMyEndpoint());
    let myServer = new Server(endpointManager.getMyEndpoint().host, endpointManager.getMyEndpoint().port);
    myServer.listen(async(socket, data) => {
        socket.write(JSON.stringify({}));
        logR(data.msg);
        if (data.msg == "STOP") {
            socket.destroy();
            myServer.close();
            process.exit();
            return;
        }
        for (let i = 0; i < endpointManager.getMyNeighbors().length; i++) {
            let neighbor = endpointManager.getMyNeighbors()[i];
            if (!neighbor.contactedAlready) {
                try {
                    neighbor.contactedAlready = true;
                    let msg = {msg: 'My id: ' + myId};
                    let client = new Client(neighbor.host, neighbor.port);
                    await client.connect();
                    await client.send(msg);
                    client.close();
                    logS(msg.msg, neighbor);
                    neighbor.contactedAlready = true;
                } catch(e) {
                    neighbor.contactedAlready = false;
                    console.log('Could not contact neighbor: ' + JSON.stringify(neighbor));
                }
            }
        }
    });

}

main();