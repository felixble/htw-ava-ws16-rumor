import { ElectionNode } from './electionNode';
import { MessageTypes } from './messageTypes';
import { Random } from '../lib/random';
import { Semaphore } from '../lib/async-semaphore';

export class Candidate extends ElectionNode {

    constructor(server, endpointManager, receives) {
        super(server, endpointManager);
        this.logI('Starting candidate node');
        this.receives = receives;
        this.feedbackCounter = 0;

        this.campaignCounter = 0;
        this.chooseMeCounter = 0;
        this.semaFeedbackCounter = new Semaphore(1);
    }

    _getStatus() {
        let status = super._getStatus();
        status.receives = this.receives;
        status.feedbackCounter = this.feedbackCounter;
        status.campaignCounter = this.campaignCounter;
        status.chooseMeCounter = this.chooseMeCounter;
        status.semaFeedbackCounter = this.semaFeedbackCounter.currentValue();
        return status;
    }

    async _runAlgorithm(data, socket) {
        let msgAlreadyHandled = await super._runAlgorithm(data, socket);
        if (!msgAlreadyHandled) {
            let type = data.type;
            switch (type) {
                case MessageTypes.NOT_YOU:
                {
                    await this.incFeedbackCounter();
                    break;
                }
                case MessageTypes.KEEP_IT_UP:
                {
                    await this.incFeedbackCounter();
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

    async incFeedbackCounter() {
        await this.semaFeedbackCounter.take();
        this.feedbackCounter++;
        if (this.feedbackCounter % this.receives === 0) {
            await this.startCampaignOrChooseMeRumor();
        }
        this.semaFeedbackCounter.leave();
    }

    async startCampaignOrChooseMeRumor() {
        if (Candidate.shouldISentACampaign()) {
            this.campaignCounter++;
            this.logI(`Start my ${this.campaignCounter}. campaign`);
            let currCampaignCounter = this.campaignCounter;
            await this.campaignAlgorithm.initEcho(this.endpointManager.getMyId(), async () => {
                this.logI(`Campaign ${currCampaignCounter} distributed successfully`);
                await this.startCampaignOrChooseMeRumor();
            });
        } else {
            this.chooseMeCounter++;
            this.logI(`Start my ${this.chooseMeCounter}. choose-me rumor distribution`);
            await this.chooseMeAlgorithm.distributeRumor(this.endpointManager.getMyId());
        }
    }

    static shouldISentACampaign() {
        return Random.randomBoolean();
    }

}