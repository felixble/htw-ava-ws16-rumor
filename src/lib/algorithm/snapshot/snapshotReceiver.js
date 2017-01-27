import { SnapshotMessageType, SnapshotMessageResponse} from './snapshotMessageTypes';

export class SnapshotReceiver {

    /**
     * @callback SendMsgCallback
     * @param {object} node
     * @param node.host {string}
     * @param node.port {string|number}
     * @param {object} msg
     * @return {object} response
     */

    /**
     * @param vectorClock {VectorClock}
     * @param getStatusCallback
     */
    constructor(vectorClock, getStatusCallback) {
        this.vectorClock = vectorClock;
        this.snapshotTaker = null;
        this.snapshotTimestamp = Number.MAX_VALUE;
        this.getStatusCallback = getStatusCallback;
        this.statusAlreadySent = false;
    }

    /**
     * @param sendMsgCallback {SendMsgCallback}
     */
    setSendMsgCallback(sendMsgCallback) {
        this.sendMsgCallback = sendMsgCallback;
    }

    /**
     *
     * @param msg {object}
     * @param msg.content {object}
     * @param msg.snapshotTaker {object}
     * @param msg.snapshotTaker.id {object}
     * @param msg.snapshotTaker.host {string}
     * @param msg.snapshotTaker.port {string|number}
     * @param msg.type {object}
     */
    async processIncomingMessage(msg) {
        let content = msg.content;
        if (msg.snapshotTaker !== null) {
            this.snapshotTaker = msg.snapshotTaker;
        }
        switch (msg.type) {
            case SnapshotMessageType.REQUEST_LOCAL_VECTOR_TIMESTAMP:
                await this._sendLocalTimestampToSnapshotTaker();
                break;
            case SnapshotMessageType.TAKE_SNAPSHOT_AT:
                await this._takeSnapshotAt(content);
                break;
            case SnapshotMessageType.UPDATE_VECTOR_CLOCK:
                await this._updateVectorClock();
                break;
            default:
                throw new Error(`Illegal-state: Unknown message type ${msg.type}`)
        }
    }

    async _sendLocalTimestampToSnapshotTaker() {
        let myLocalTime = this.vectorClock.getMyTime();
        await this._sendMsg(this.snapshotTaker, SnapshotMessageType.RESPONSE, myLocalTime);
    }

    async _takeSnapshotAt(content) {
        let response;
        let timestamp = parseInt(content, 10);
        if (timestamp > this.vectorClock.getMyTime()) {
            this.snapshotTimestamp = timestamp;
            response = SnapshotMessageResponse.VALID_SNAPSHOT_TIMESTAMP;
        } else {
            response = SnapshotMessageResponse.INVALID_SNAPSHOT_TIMESTAMP;
        }
        await this._sendMsg(this.snapshotTaker, SnapshotMessageType.RESPONSE, response);
    }

    async _updateVectorClock() {
        if (this.statusAlreadySent) {
            return;
        }
        this.statusAlreadySent = true;
        await this._sendMsg(this.snapshotTaker, SnapshotMessageType.RESPONSE, this.getStatusCallback());
    }

    async _sendMsg(node, type, content = '') {
        if (!this.sendMsgCallback) {
            throw new Error('invalid-state: sendMsgCallback is not set!');
        }

        await this.sendMsgCallback(
            node,
            {
                content: content,
                snapshotTaker: this.myEndpoint,
                type: type
            }
        );
    }
}