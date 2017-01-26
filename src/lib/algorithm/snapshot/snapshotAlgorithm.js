import { SnapshotMessageType } from './snapshotMessageTypes';
import { SnapshotMessageResponse } from './snapshotMessageTypes';
import { SnapshotState, STATES } from './snapshotState';

const CONSTANT_START_VALUE_PER_NODE = 125;
const FACTOR_TO_INCREASE_CONSTANT = 2;

export class SnapshotAlgorithm {

    /**
     * @callback SendMsgCallback
     * @param {object} node
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
        this.constantFactorToAddToMaxTimestamp = CONSTANT_START_VALUE_PER_NODE * nodes.length;
        this.calculatedSnapshotTimestampSuccessfully = false;
        this.snapshotTimestamp = 0;
        this.state = new SnapshotState();
    }

    /**
     * @param sendMsgCallback {SendMsgCallback}
     */
    setSendMsgCallback(sendMsgCallback) {
        this.sendMsgCallback = sendMsgCallback;
    }

    async takeSnapshot() {
        await this._collectVectorTimestamps();
    }

    async _collectVectorTimestamps() {
        this._sendMsgToAllNodes(SnapshotMessageType.REQUEST_LOCAL_VECTOR_TIMESTAMP);
    }

    async _fetchLocalVectorTimestamp(node) {
        try {
            await this._trySendMsg(node, SnapshotMessageType.REQUEST_LOCAL_VECTOR_TIMESTAMP);
        } catch (e) {
            return false;
        }
        return true;
    }

    async processIncomingMessage(msg, senderId) {
        let content = msg.content;
        let reset = false;
        if (this.state.isReceivingTimestamps()) {
            this._setTimestampForNode(content, senderId);
        }
        if (this.state.isReceivingAcknowledgments()) {
            reset = !this._isAcknowledgement(content);
        }
        this.state.incomingResponse(reset);
        await this._performActionForCurrentState();
    }

    _setTimestampForNode(timestamp, nodeId) {
        this.nodes.forEach(node => {
            if (node.id === nodeId) {
                node.timestamp = timestamp;
            }
        })
    }

    _isAcknowledgement(content) {
        let success = (content === SnapshotMessageResponse.VALID_SNAPSHOT_TIMESTAMP);
        if (!success) {
            this._increaseConstantFactor();
        }
        return success;
    }

    _increaseConstantFactor() {
        this.constantFactorToAddToMaxTimestamp *= FACTOR_TO_INCREASE_CONSTANT;
    }

    async _performActionForCurrentState() {
        if (this.state.isWaiting()) {
            return;
        }

        if (this.state.isCalculateSnapshotTimestamp()) {
            await this._calculateAndDistributeSnapshotTimestamp();
        }
        if (this.state.isTimestampDistributed()) {
            await this._forceTakingSnapshotByManipulatingAllClocks();
        }
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
        await this._sendMsgToAllNodes(SnapshotMessageType.TAKE_SNAPSHOT_AT, this.snapshotTimestamp);
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
        await this._sendMsgToAllNodes(SnapshotMessageType.UPDATE_VECTOR_CLOCK);
    }

    async _sendMsgToAllNodes(type, content = '') {
        let contactedNodesCount = 0;
        for(let i=0; i<this.nodes.length; i++) {
            let node = this.nodes[i];
            let success = await this._sendMsg(node,type, content);
            if (success) {
                contactedNodesCount++;
            }
        }
        this.state.waitForResponses(contactedNodesCount);
    }

    async _sendMsg(node, type, content = '') {
        try {
            this._trySendMsg(node, type, content);
        } catch(e) {
            // TODO: LOG ERROR!
            return false;
        }
        return true;
    }

    async _trySendMsg(node, type, content = '') {
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