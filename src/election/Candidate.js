import { ElectionNode } from './electionNode';
import { MessageTypes } from './messageTypes';
import { Random } from '../lib/random';

export class Candidate extends ElectionNode {

    constructor(server, endpointManager, receives) {
        super(server, endpointManager);
        this.receives = receives;
        this.feedbackCounter = 0;

        this.campaignCounter = 0;
        this.chooseMeCounter = 0;
    }

    async _runAlgorithm(data, socket) {
        let msgAlreadyHandled = await super._runAlgorithm(data, socket);
        if (!msgAlreadyHandled) {
            let type = data.type;
            switch (type) {
                case MessageTypes.NOT_YOU:
                case MessageTypes.KEEP_IT_UP:
                {
                    this.incFeedbackCounter();
                    if (this.reachedFeedbackThreshold()) {
                        await this.startCampaignOrChooseMeRumor();
                    }
                    break;
                }
                case MessageTypes.INIT:
                {
                    await this.startCampaignOrChooseMeRumor();
                    break;
                }
            }
        }
    }

    incFeedbackCounter() {
        this.feedbackCounter++;
    }

    reachedFeedbackThreshold() {
        if (this.feedbackCounter >= this.receives) {
            this.feedbackCounter = 0;
            return true;
        }
        return false;
    }

    async startCampaignOrChooseMeRumor() {
        let campaign = Random.randomBoolean();
        if (campaign) {
            this.campaignCounter++;
            this.logI(`Start my ${this.campaignCounter}. campaign`);
            let currCampaignCounter = this.campaignCounter;
            await this.campaignAlgorithm.initEcho(this.endpointManager.getMyId(), () => {
                this.logI(`Campaign ${currCampaignCounter} distributed successfully`);
            });
        } else {
            this.chooseMeCounter++;
            this.logI(`Start my ${this.chooseMeCounter}. choose-me rumor distribution`);
            await this.chooseMeAlgorithm.distributeRumor(this.endpointManager.getMyId());
        }
    }

}