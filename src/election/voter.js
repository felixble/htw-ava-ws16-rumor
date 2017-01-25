import { _ } from 'underscore';
import { ElectionNode } from './electionNode'
import { MessageTypes } from './messageTypes';
import { ConfidenceLevel } from './confidenceLevel'
import { CandidateIdsManager } from './candidateIdsManager'

export class Voter extends ElectionNode {

    constructor(server, endpointManager) {
        super(server, endpointManager);
        let neighborCandidates = this.endpointManager.getMyNeighbors().filter(neighbor => {
            return CandidateIdsManager.amIACandidate(neighbor.id);
        });
        this.myCandidatesId = (neighborCandidates.length === 0) ? false : neighborCandidates[0].id;
        this.confidenceLevel = new ConfidenceLevel(this.myCandidatesId);
        this.chooseMeAlgorithm.setOnNewIncomingRumorListener(_.bind(this.onNewIncomingChooseMeMsg, this));
        this.campaignAlgorithm.setNewMessageListener(_.bind(this.onNewIncomingCampaignMsg, this));
    }

    _getStatus() {
        let status = super._getStatus();
        if (this.myCandidatesId) {
            status.type = 'supporter';
            status.supports = this.myCandidatesId;
        } else {
            status.type = 'voter';
        }
        status.confidenceLevel = this.confidenceLevel.level;

        return status;
    }

    onNewIncomingChooseMeMsg(candidateId) {
        this.confidenceLevel.updateLevelOnNewChooseMeMsg(candidateId);
        let isFavorite = this.confidenceLevel.isFavorite(candidateId);
        let feedbackPromise;
        if (isFavorite) {
            feedbackPromise = this.sendKeepItUp(candidateId); // this is async !
        } else {
            feedbackPromise = this.sendNotYou(candidateId); // this is async !
        }
        feedbackPromise.catch(e => {
            if (!e.stack) console.error(e);
            else console.error(e.stack);
        });
        return isFavorite;
    }

    onNewIncomingCampaignMsg(candidateId) {
        this.confidenceLevel.updateLevelOnNewCampaign(candidateId);
    }

    async sendKeepItUp(candidateId) {
        await this.sendMsgToCandidate(candidateId, MessageTypes.KEEP_IT_UP);
    }

    async sendNotYou(candidateId) {
        await this.sendMsgToCandidate(candidateId, MessageTypes.NOT_YOU);
    }

    async sendMsgToCandidate(candidateId, type) {
        await this.sendMsgTo(this.endpointManager.findEndpointById(candidateId), '', type);
    }
}