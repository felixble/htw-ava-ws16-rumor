import { EchoStates } from './echoStates';
let randomstring = require('randomstring');

let generateId = function () {
    return randomstring.generate(7);
};

export class EchoAlgorithm {

    /**
     * @callback SendMsgCallback
     * @param {object} neighbor
     * @param {object} msg
     */

    /**
     * @callback NewMessageListener
     * @param {object} message content
     */

    /**
     *
     * @param neighbors
     * @param sendMsgCallback {SendMsgCallback}
     */
    constructor(neighbors, sendMsgCallback) {
        /** @type {EchoStates} */
        this.states = new EchoStates();
        this.neighbors = neighbors;
        /** @type {SendMsgCallback} */
        this.sendMsgCallback = sendMsgCallback;
        /** @type {NewMessageListener} */
        this.newMessageListener = null;
    }

    /**
     *
     * @param {NewMessageListener} listener
     */
    setNewMessageListener(listener) {
        this.newMessageListener = listener;
    }

    async initEcho(content, onEchoDistributed = false) {
        let id = generateId();
        let state = this.getState(id);

        state.onEchoDistributed = onEchoDistributed;
        state.initiator = true;
        state.message = content;
        state.setRed();

        await this.sendExplorer(id, content);
    }

    /**
     * Processes an incoming echo message.
     *
     * @param msg           the incoming message
     * @param neighborId    the id of the neighbor
     *                      who sent the message
     */
    async processIncomingMsg(msg, neighborId) {
        let content = msg.content;
        let msgId = msg.id;
        let state = this.getState(msgId);

        if (state.message === null) {
            state.message = content;
            if (null !== this.newMessageListener) {
                this.newMessageListener(content);
            }
        }

        state.incCounter();

        if (state.isWhite()) {
            state.setRed();
            await this.sendExplorer(msgId, content, neighborId);
            state.setFirstNeighborId(neighborId);
        }

        if (state.getCounter() === this._getNeighborsCount()) {
            state.setGreen();
            if (state.initiator) {
                if (state.onEchoDistributed) {
                    state.onEchoDistributed();
                }
            } else {
                await this.sendEchoTo(state.getFirstNeighborId(), msgId);
            }
        }
    }

    async sendExplorer(id, content, skip = null) {
        for (let i = 0; i < this._getNeighborsCount(); i++) {
            let neighbor = this._getNeighbor(i);
            if (skip !== neighbor.id) {
                await this.sendMsg(neighbor, id, content, 'explorer');
            }
        }
    }

    async sendEchoTo(neighborId, id) {
        await this.sendMsg(this._getNeighborById(neighborId), id, '', 'echo');
    }

    async sendMsg(neighbor, id, content, type) {
        await this.sendMsgCallback(
            neighbor,
            {
                id: id,
                content: content,
                type: type
            }
        );
    }

    /**
     * 
     * @param id
     * @returns {EchoState}
     */
    getState(id) {
        return this.states.get(id);
    }
    
    _getNeighborsCount() {
        return this.neighbors.length;
    }
    
    _getNeighbor(index) {
        return this.neighbors[index];
    }

    _getNeighborById(id) {
        for(let i=0; i<this._getNeighborsCount(); i++) {
            let neighbor = this._getNeighbor(i);
            if (neighbor.id === id) {
                return neighbor;
            }
        }
        throw new Error('illegal-state', 'Node has no neighbor with id ' + id);
    }
}