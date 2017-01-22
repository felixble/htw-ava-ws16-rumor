import { _ } from 'underscore';
import { Client } from './lib/client';
import { Semaphore } from './lib/async-semaphore';
import { VectorClock } from './lib/vector-clock';
import { MessageTypes } from './election/messageTypes'

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
        /** @type {EndpointManager} */
        this.endpointManager = endpointManager;
        this.sem = new Semaphore(1);
        this.killed = false;
        this.myVectorTime = new VectorClock(endpointManager.getMyId());
        this.finishedTimestamp = -1;
    }

    /**
     * @callback MessageProcessor
     * @param socket
     * @param data
     */

    /**
     * Returns a function which defines the
     * handling of incoming messages.
     *
     * @returns {MessageProcessor}
     */
    getMessageProcessor() {
        // "I am born"-tick ;-)
        this.myVectorTime.tick();
        this.logI('Hello! You can contact me at ' + JSON.stringify(this.endpointManager.getMyEndpoint())
                    + ' My direct neighbors are: ' + JSON.stringify(this.endpointManager.getMyNeighbors()));
        return _.bind(this.onReceiveData, this);
    }

    /**
     * Processes an incoming message.
     */
    async onReceiveData(socket, data) {
        try {
            if (data.type === MessageTypes.GET_STATUS) {
                socket.write(JSON.stringify(this._getStatus()));
            } else if (MessageTypes.doSendEmptyResponse(data.type)) {
                socket.write(JSON.stringify({}));
            }
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

            if (data.type === MessageTypes.CONTROL) {
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
                if (this._isFinished()) {
                    this._saveFinishedTimestamp();
                }
                if (!this._isFinished() || data.type === MessageTypes.SNAPSHOT) {
                    await this._runAlgorithm(data, socket);
                } else {
                    this.logE(`I am finished. Cannot process incoming msg of type ${data.type}`);
                }
            }
            this.sem.leave();
        } catch(e) {
            try {
                let myId = this.endpointManager.getMyId();
                console.error(`Unknown error occurred on node ${myId}`);
            } catch(ignored) {}
            if (!e.stack) console.error(e);
            else console.error(e.stack);
            this.sem.leave();
        }
    }

    stop() {
        this.killed = true;
        this.server.close();
        this.log('SHUTDOWN', '');
    }

    async sendStopSignalToNeighbors() {
        for (let i = 0; i < this.endpointManager.getMyNeighbors().length; i++) {
            let neighbor = this.endpointManager.getMyNeighbors()[i];
            this.sendMsgTo(neighbor, 'STOP ALL', MessageTypes.CONTROL);
        }
    }

    _getStatus() {
        let status = (this.killed) ? 'dead' : 'ok';
        return {
            myId: this.endpointManager.getMyId(),
            neighbors: this.endpointManager.getMyNeighbors().map(n => { return n.id }),
            semaProcessMsg: this.sem.currentValue(),
            myLocalTime: this.myVectorTime.getMyTime(),
            finishedTimestamp: this.finishedTimestamp,
            status: status
        }
    }

    async _runAlgorithm(incomingMsg, socket) {
    }

    _saveFinishedTimestamp() {
        if (this.finishedTimestamp === -1) {
            this.finishedTimestamp = this.myVectorTime.getMyTime();
        }
    }

    _isFinished() {
        return this.killed;
    }

    async sendMsgTo(neighbor, content, type) {
        try {
            this.myVectorTime.tick();
            let client = new Client(neighbor.host, neighbor.port);
            await client.connect();
            let msg = this.prepareMessage(content, type);
            this.logS(JSON.stringify(msg), neighbor);
            let response = await client.send(msg);
            client.close();
            return response;
        } catch(e) {
            this.logE('Could not contact neighbor: ' + JSON.stringify(neighbor));
        }
        return null;
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
        //if (msg.hasOwnProperty('msg') && msg.hasOwnProperty('type')) {
        //    msg = `${msg.msg} of type ${msg.type}`;
        //}
        this.log('SEND   ', `${msg} to ${nodeStr}`);
    }

    logI(msg) {
        this.log('INFO   ', msg);
    }

    logE(msg) {
        this.log('ERROR  ', msg);
    }

}