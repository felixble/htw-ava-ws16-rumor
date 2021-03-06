import { _ } from 'underscore';
import { ServerLogic } from '../network-core/serverLogic';
import { EchoAlgorithm } from '../lib/algorithm/echoAlgorithm';
import { RumorAlgorithm } from '../lib/algorithm/rumorAlgorithm';
import { SnapshotReceiver } from '../lib/algorithm/snapshot/snapshotReceiver';
import { MessageTypes } from './messageTypes';
import { CandidateIdsManager } from './candidateIdsManager';

export class ElectionNode extends ServerLogic {

    constructor(server, endpointManager) {
        super(server, endpointManager);
        // the campaign should reach all nodes including candidates
        /** @type {EchoAlgorithm} */
        this.campaignAlgorithm =
            new EchoAlgorithm(this.endpointManager.getMyNeighbors(), _.bind(this.sendCampaignMsgTo, this));
        // the choose me algorithm should only reach voters.
        // a supporter should not sent a rumor to the candidate he supports
        let friends = this.endpointManager.getMyNeighbors().filter(neighbor => {
            return !CandidateIdsManager.amIACandidate(neighbor.id);
        });
        /** @type {RumorAlgorithm} */
        this.chooseMeAlgorithm = new RumorAlgorithm(
            this.endpointManager.getMyId(),
            friends,
            _.bind(this.sendChooseMeMsgTo, this));
        /** @type {SnapshotReceiver} */
        this.snapshotReceiver = new SnapshotReceiver(this.myVectorTime, _.bind(this.getStatusCallback, this));
        this.snapshotReceiver.setSendMsgCallback(_.bind(this.sendSnapshotResponse, this));
    }

    _isFinished() {
        return this._isSnapshotTimeReached();
    }

    _isSnapshotTimeReached() {
        return (this.myVectorTime.getMyTime() >= this.snapshotReceiver.snapshotTimestamp);
    }

    _getStatus() {
        return super._getStatus();
    }

    async _runAlgorithm(data, socket) {
        let type = data.type;
        let msg = data.msg;
        let senderId = data.from;

        switch (type) {
            case MessageTypes.CAMPAIGN:
            {
                await this.campaignAlgorithm.processIncomingMsg(msg, senderId);
                break;
            }
            case MessageTypes.CHOOSE_ME:
            {
                await this.chooseMeAlgorithm.processIncomingMessage(msg, senderId);
                break;
            }
            case MessageTypes.SNAPSHOT:
            {
                await this.snapshotReceiver.processIncomingMessage(msg);
                break;
            }
            default: return false;
        }
        return true;
    }

    async sendCampaignMsgTo(neighbor, msg) {
        await this.sendMsgTo(neighbor, msg, MessageTypes.CAMPAIGN);
    }

    async sendChooseMeMsgTo(neighbor, msg) {
        await this.sendMsgTo(neighbor, msg, MessageTypes.CHOOSE_ME);
    }

    getStatusCallback() {
        return this._getStatus();
    }

    async sendSnapshotResponse(node, msg) {
        await this.sendMsgTo(node, msg, MessageTypes.SNAPSHOT);
    }

}