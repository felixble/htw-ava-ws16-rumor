import { SnapshotMessageType, SnapshotMessageResponse} from './snapshotMessageTypes';

export class SnapshotReceiver {

    /**
     * @param vectorClock {VectorClock}
     */
    constructor(vectorClock) {
        this.vectorClock = vectorClock;
        this.snapshotTaker = null;
        this.snapshotTimestamp = Number.MAX_VALUE;
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
    processIncomingMessage(msg) {
        let content = msg.content;
        if (msg.snapshotTaker !== null) {
            this.snapshotTaker = msg.snapshotTaker;
        }
        switch (msg.type) {
            case SnapshotMessageType.GET_LOCAL_VECTOR_TIMESTAMP:
                return this._getLocalVectorTimestamp();
            case SnapshotMessageType.TAKE_SNAPSHOT_AT:
                return this._takeSnapshotAt(content);
            case SnapshotMessageType.UPDATE_VECTOR_CLOCK:
                return SnapshotReceiver._updateVectorClock();
            default:
                return {error: `unknown message type ${msg.type}`};
        }
    }

    _getLocalVectorTimestamp() {
        return this.vectorClock.getMyTime();
    }

    _takeSnapshotAt(content) {
        this.snapshotTimestamp = parseInt(content, 10);
        return {};
    }

    static _updateVectorClock() {
        return {};
    }
}