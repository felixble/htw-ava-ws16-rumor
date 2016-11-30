import { Client } from './lib/client'
import { Semaphore } from './lib/async-semaphore'

export class ServerLogic {

    constructor(server, endpointManager) {
        this.server = server;
        this.endpointManager = endpointManager;
        this.sem = new Semaphore(1);
        this.killed = false;
    }

    onReceiveData() {
        return async(socket, data) => {
            try {
                socket.write(JSON.stringify({}));
                await this.sem.take();

                if (this.killed) {
                    this.sem.leave();
                    return;
                }

                this.logR(JSON.stringify(data));
                if (data.msg === "STOP") {
                    this.stop();
                    return;
                }
                if (data.msg === "STOP ALL") {
                    await this.sendStopSignalToNeighbors();
                    this.stop();
                    return;
                }
                await this._runAlgorithm(data, socket);
                this.sem.leave();
            } catch(e) {
                console.error(e);
            }
        };
    }

    stop() {
        this.killed = true;
        this.server.close();
        this.log('SHUTDOWN', '');
    }

    async sendStopSignalToNeighbors() {
        for (let i = 0; i < this.endpointManager.getMyNeighbors().length; i++) {
            let neighbor = this.endpointManager.getMyNeighbors()[i];
            try {
                let msg = {msg: 'STOP ALL', from: this.endpointManager.getMyId()};
                let client = new Client(neighbor.host, neighbor.port);
                await client.connect();
                await client.send(msg);
                client.close();
                this.logS(msg.msg, neighbor);
            } catch(e) {
                this.logE('Could not contact neighbor: ' + JSON.stringify(neighbor));
            }
        }
    }

    async _runAlgorithm(incomingMsg, socket) {
    }

    log(type, msg) {
        let date = new Date();
        let myId = this.endpointManager.getMyId();
        console.log(`${type} (${myId}) (${date}): ${msg}`);
    }

    logR(msg) {
        this.log('RECEIVE', msg);
    }

    logS(msg, node) {
        let nodeStr = JSON.stringify(node);
        this.log('SEND   ', `${msg} to ${nodeStr}`);
    }

    logI(msg) {
        this.log('INFO   ', msg);
    }

    logE(msg) {
        this.log('ERROR  ', msg);
    }

}