import { ServerLogic } from './serverLogic'
import { Client } from './lib/client'

export class HelloServer extends ServerLogic {

    async _runAlgorithm(incomingMsg, socket) {
        for (let i = 0; i < this.endpointManager.getMyNeighbors().length; i++) {
            let neighbor = this.endpointManager.getMyNeighbors()[i];
            if (!neighbor.contactedAlready) {
                try {
                    neighbor.contactedAlready = true;
                    let msg = {msg: 'My id: ' + this.endpointManager.getMyId(), type: 'rumor'};
                    let client = new Client(neighbor.host, neighbor.port);
                    await client.connect();
                    await client.send(msg);
                    client.close();
                    this.constructor.logS(msg.msg, neighbor);
                } catch(e) {
                    neighbor.contactedAlready = false;
                    console.log('Could not contact neighbor: ' + JSON.stringify(neighbor));
                }
            }
        }
    }

}