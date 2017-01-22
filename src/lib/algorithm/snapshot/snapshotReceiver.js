import { SnapshotMessageType, SnapshotMessageResponse} from './snapshotMessageTypes';

export class SnapshotReceiver {

    /**
     * @param vectorClock {VectorClock}
     * @param takeSnapshotCallback
     */
    constructor(vectorClock, takeSnapshotCallback) {
        this.vectorClock = vectorClock;
        this.snapshotTaker = null;
        this.snapshotTimestamp = Number.MAX_VALUE;
        this.takeSnapshotCallback = takeSnapshotCallback;
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
                return this._updateVectorClock();
            default:
                return {error: `unknown message type ${msg.type}`};
        }
    }

    _getLocalVectorTimestamp() {
        return this.vectorClock.getMyTime();
    }

    _takeSnapshotAt(content) {
        let timestamp = parseInt(content, 10);
        if (timestamp > this.vectorClock.getMyTime()) {
            this.snapshotTimestamp = timestamp;
            return SnapshotMessageResponse.VALID_SNAPSHOT_TIMESTAMP;
        } else {
            return SnapshotMessageResponse.INVALID_SNAPSHOT_TIMESTAMP;
        }
    }

    _updateVectorClock() {
        if (this.takeSnapshotCallback) {
            this.takeSnapshotCallback(this.snapshotTaker);
        }
        return {};
    }
}