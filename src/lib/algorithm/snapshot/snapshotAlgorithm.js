import { SnapshotMessageType } from './snapshotMessageTypes';
import { SnapshotMessageResponse } from './snapshotMessageTypes';

const CONSTANT_START_VALUE = 20;

export class SnapshotAlgorithm {

    /**
     * @callback SendMsgCallback
     * @param {object} nod
     * @param node.host {string}
     * @param node.port {string|number}
     * @param {object} msg
     * @return {object} response
     */

    /**
     * @param myEndpoint {object}
     * @param myEndpoint.id {object}
     * @param myEndpoint.host {string}
     * @param myEndpoint.port {string|number}
     * @param nodes {object[]}
     * @param nodes.id {object}
     * @param nodes.host {string}
     * @param nodes.port {string|number}
     * @param vectorClock {VectorClock}
     */
    constructor(myEndpoint, nodes, vectorClock) {
        this.myEndpoint = myEndpoint;
        this.nodes = nodes;
        this.vectorClock = vectorClock;
        this.sendMsgCallback = null;
        this.constantFactorToAddToMaxTimestamp = CONSTANT_START_VALUE;
        this.calculatedSnapshotTimestampSuccessfully = false;
        this.snapshotTimestamp = 0;
    }

    /**
     * @param sendMsgCallback {SendMsgCallback}
     */
    setSendMsgCallback(sendMsgCallback) {
        this.sendMsgCallback = sendMsgCallback;
    }

    async takeSnapshot() {
        while (!this._isTimestampSuccessfullyCalculated()) {
            await this._collectVectorTimestamps();
            await this._calculateAndDistributeSnapshotTimestamp();
            this._increaseConstantFactor();
        }
        await this._forceTakingSnapshotByManipulatingAllClocks();
    }

    _isTimestampSuccessfullyCalculated() {
        return this.calculatedSnapshotTimestampSuccessfully;
    }

    async _collectVectorTimestamps() {
        for(let i=0; i<this.nodes.length; i++) {
            let node = this.nodes[i];
            node.timestamp = await this._fetchLocalVectorTimestamp(node);
        }
    }

    async _fetchLocalVectorTimestamp(node) {
        return await this._sendMsg(node, SnapshotMessageType.GET_LOCAL_VECTOR_TIMESTAMP);
    }

    async _calculateAndDistributeSnapshotTimestamp() {
        this._calculateSnapshotTimestamp();
        await this._distributeSnapshotTimestamp();
    }

    _calculateSnapshotTimestamp() {
        let maxTimestamp = 0;
        for(let i=0; i<this.nodes.length; i++) {
            let node = this.nodes[i];
            if (node.timestamp > maxTimestamp) {
                maxTimestamp = node.timestamp;
            }
        }
        this.snapshotTimestamp = maxTimestamp + this.constantFactorToAddToMaxTimestamp;
    }

    async _distributeSnapshotTimestamp() {
        for(let i=0; i<this.nodes.length; i++) {
            let node = this.nodes[i];
            let response = await this._sendMsg(node, SnapshotMessageType.TAKE_SNAPSHOT_AT, this.snapshotTimestamp);
            let success = (response === SnapshotMessageResponse.VALID_SNAPSHOT_TIMESTAMP);
            if (!success) {
                return;
            }
        }
        this.calculatedSnapshotTimestampSuccessfully = true;
    }

    _increaseConstantFactor() {
        this.constantFactorToAddToMaxTimestamp *= 2;
    }

    async _forceTakingSnapshotByManipulatingAllClocks() {
        this._manipulateVectorClock();
        await this._distributeManipulatedTimestamp();
    }

    _manipulateVectorClock() {
        for(let i=0; i<this.nodes.length; i++) {
            let node = this.nodes[i];
            this.vectorClock.updateTimeForId(node.id, this.snapshotTimestamp);
        }
    }

    async _distributeManipulatedTimestamp() {
        for(let i=0; i<this.nodes.length; i++) {
            let node = this.nodes[i];
            await this._sendMsg(node, SnapshotMessageType.UPDATE_VECTOR_CLOCK);
        }
    }

    async _sendMsg(node, type, content = '') {
        if (!this.sendMsgCallback) {
            throw new Error('invalid-state: sendMsgCallback is not set!');
        }
        return await this.sendMsgCallback(
            node,
            {
                content: content,
                snapshotTaker: this.myEndpoint,
                type: type
            }
        );
    }
}