import { Server } from './lib/server';
import { Client } from './lib/client';
import { GraphvizParser } from './graphvizParser';

let readFile = require('./lib/read-file');
let readLine = require('./lib/read-line');
let endpointParser = require('./endpointParser');

const endpointFilename = './config/endpoints';
const graphFilename = './config/graph';

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
    let rawEndpointsFile = await readFile(endpointFilename);
    let endpoints = endpointParser.parse(rawEndpointsFile);
    let myId = await readLine('Please insert the ID of this endpoint:');
    let myEndpoint = endpointParser.getEndpointById(myId, endpoints);
    console.log(myEndpoint);
    let rawGraphFile = await readFile(graphFilename);
    let graphvizParser = new GraphvizParser();
    graphvizParser.parse(rawGraphFile);
    let myNeighbors = endpointParser.getEndpoints(graphvizParser.getNode(myId).neighbors, endpoints);
    let myServer = new Server(myEndpoint.host, myEndpoint.port);
    myServer.listen(async(socket, data) => {
        socket.write(JSON.stringify({}));
        logR(data.msg);
        if (data.msg == "STOP") {
            socket.destroy();
            myServer.close();
            process.exit();
            return;
        }
        for (let i = 0; i < myNeighbors.length; i++) {
            let neighbor = myNeighbors[i];
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