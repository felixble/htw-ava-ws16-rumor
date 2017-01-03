import { Client } from './lib/client';
import { Semaphore } from './lib/async-semaphore';
import { VectorClock } from './lib/vector-clock';

/**
 * Base class of the server logic,
 * which can execute actions for given control
 * messages and pass other incoming messages
 * to a concrete implementation.
 *
 * With a semaphore we make sure that only one message
 * will be handled at a specific time.
 */
export class ServerLogic {

    constructor(server, endpointManager) {
        this.server = server;
        this.endpointManager = endpointManager;
        this.sem = new Semaphore(1);
        this.killed = false;
        this.myVectorTime = new VectorClock(endpointManager.getMyId());
    }

    /**
     * Returns a function which defines the
     * handling of incoming messages.
     *
     * @returns {function(socket, data)}
     */
    onReceiveData() {
        // "I am born"-tick ;-)
        this.myVectorTime.tick();
        this.logI('Hello! You can contact me at ' + JSON.stringify(this.endpointManager.getMyEndpoint()));
        return async(socket, data) => {
            try {
                socket.write(JSON.stringify({}));
                await this.sem.take();

                if (this.killed) {
                    this.sem.leave();
                    return;
                }

                this.myVectorTime.tick();
                if (data.time) {
                    this.myVectorTime.update(VectorClock.createFromJSON(data.time));
                }

                this.logR(JSON.stringify(data));

                if (data.type === 'control') {
                    if (data.msg === "STOP") {
                        this.stop();
                        return;
                    }
                    if (data.msg === "STOP ALL") {
                        await this.sendStopSignalToNeighbors();
                        this.stop();
                        return;
                    }
                } else {
                    await this._runAlgorithm(data, socket);
                }
                this.sem.leave();
            } catch(e) {
                if (!e.stack) console.error(e);
                else console.error(e.stack);
                this.sem.leave();
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
                this.sendMsgTo(neighbor, 'STOP ALL', 'control');
            } catch(e) {
                this.logE('Could not contact neighbor: ' + JSON.stringify(neighbor));
            }
        }
    }

    async _runAlgorithm(incomingMsg, socket) {
    }

    async sendMsgTo(neighbor, content, type) {
        this.myVectorTime.tick();
        let client = new Client(neighbor.host, neighbor.port);
        await client.connect();
        let msg = this.prepareMessage(content, type);
        this.logS(msg.msg, neighbor);
        await client.send(msg);
        client.close();
    }

    prepareMessage(content, type) {
        return {msg: content, from: this.endpointManager.getMyId(), type: type, time: this.myVectorTime.toJSON()};
    }

    log(type, msg) {
        let date = new Date();
        let myId = this.endpointManager.getMyId();
        let vectorTime = this.myVectorTime.toString();
        console.log(`${type} (${myId}) (${date}) (${vectorTime}): ${msg}`);
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