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
        this.myCandidate = (neighborCandidates.length === 0) ? false : neighborCandidates[0];
        this.confidenceLevel = new ConfidenceLevel(this.myCandidate);
        this.chooseMeAlgorithm.setOnNewIncomingRumorListener(_.bind(this.onNewIncomingChooseMeMsg, this));
        this.campaignAlgorithm.setNewMessageListener(_.bind(this.onNewIncomingCampaignMsg, this));
    }

    onNewIncomingChooseMeMsg(candidateId) {
        this.confidenceLevel.updateLevelOnNewChooseMeMsg(candidateId);
        let isFavourite = this.confidenceLevel.isFavourite(candidateId);
        if (isFavourite) {
            this.sendKeepItUp(candidateId); // this is async !

        } else {
            this.sendNotYou(candidateId); // this is async !
        }
        return isFavourite;
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
        await this.sendMsgTo(this.endpointManager.findNeighborById(candidateId), '', type);
    }
}