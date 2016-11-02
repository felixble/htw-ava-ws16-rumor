import { Client } from './lib/client'
import { Semaphore } from './lib/async-semaphore'

export class ServerLogic {

    constructor(server, endpointManager) {
        this.server = server;
        this.endpointManager = endpointManager;
        this.sem = new Semaphore(1);
    }

    onReceiveData() {
        return async(socket, data) => {
            socket.write(JSON.stringify({}));
            await this.sem.take();
            this.constructor.logR(JSON.stringify(data));
            if (data.msg == "STOP") {
                socket.destroy();
                this.server.close();
                process.exit();
                return;
            }
            if (data.msg == "STOP ALL") {
                await this.sendStopSignalToNeighbors();

                socket.destroy();
                this.server.close();
                process.exit();
                return;
            }
            await this._runAlgorithm(data, socket);
            this.sem.leave();
        };
    }

    async sendStopSignalToNeighbors() {
        for (let i = 0; i < this.endpointManager.getMyNeighbors().length; i++) {
            let neighbor = this.endpointManager.getMyNeighbors()[i];
            try {
                let msg = {msg: 'STOP ALL'};
                let client = new Client(neighbor.host, neighbor.port);
                await client.connect();
                await client.send(msg);
                client.close();
                this.constructor.logS(msg.msg, neighbor);
            } catch(e) {
                console.log('Could not contact neighbor: ' + JSON.stringify(neighbor));
            }
        }
    }

    async _onNewData() {

    }

    async _runAlgorithm(incomingMsg, socket) {
    }

    static log(type, msg) {
        let date = new Date();
        console.log(`${type} (${date}): ${msg}`);
    }

    static logR(msg) {
        ServerLogic.log('RECEIVE', msg);
    }

    static logS(msg, node) {
        let nodeStr = JSON.stringify(node);
        ServerLogic.log('SEND   ', `${msg} to ${nodeStr}`);
    }

}