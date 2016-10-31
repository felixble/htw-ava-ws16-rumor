import { Server } from './lib/server';
import { Client } from './lib/client';

let readFile = require('./lib/read-file');
let readLine = require('./lib/read-line');
let endpointParser = require('./endpointParser');

const filename = './config/endpoints';

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
    let rawFile = await readFile(filename);
    let endpoints = endpointParser.parse(rawFile);
    let myId = await readLine('Please insert the ID of this endpoint:');
    let myEndpoint = endpointParser.getEndpointById(myId, endpoints);
    console.log(myEndpoint);
    let myNeighbors = endpointParser.getNeighbors(myId, endpoints);
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