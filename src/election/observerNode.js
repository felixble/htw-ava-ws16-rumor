import { _ } from 'underscore';
import { ServerLogic } from '../network-core/serverLogic';
import { CandidateIdsManager } from './candidateIdsManager';
import { SnapshotAlgorithm } from '../lib/algorithm/snapshot/snapshotAlgorithm';
import { MessageTypes } from './messageTypes';

export class ObserverNode extends ServerLogic {

    constructor(server, endpointManager) {
        super(server, endpointManager);
        this.logI('Starting observer node');
        this.snapshotAlgorithm = new SnapshotAlgorithm(
            endpointManager.getMyEndpoint(), endpointManager.getMyNeighbors(), this.myVectorTime);
        this.snapshotAlgorithm.setSendMsgCallback(_.bind(this.sendSnapshotMsg, this));
        this.snapshotAlgorithm.setFinishedCallback(_.bind(this.onFinishedSnapshot, this));
    }

    async _runAlgorithm(data, socket) {
        let type = data.type;
        switch(type) {
            case 'take-snapshot':
                await this.takeSnapshot();
                break;
            case MessageTypes.SNAPSHOT:
                await this.snapshotAlgorithm.processIncomingMessage(data.msg, data.from);
                break;
            default:
                throw new Error(`illegal-state: Unknown message type ${type} of incoming message`);
        }
    }

    async takeSnapshot() {
        try {
            await this.snapshotAlgorithm.takeSnapshot();
        } catch(e) {
            if (!e.stack) console.error(e);
            else console.error(e.stack);
        }
    }

    async sendSnapshotMsg(node, content) {
        return await this.sendMsgTo(node, content, MessageTypes.SNAPSHOT);
    }

    onFinishedSnapshot(nodeStates) {
        let abstinetions = 0,
            proCandidate1 = 0,
            proCandidate2 = 0,
            voterCount = nodeStates.length,
            winner;
        nodeStates.forEach((state) => {
            let levelProId = {};
            if (state.hasOwnProperty('confidenceLevel')) {
                state.confidenceLevel.forEach(level => {
                    levelProId[level.id] = level.value;
                });
                if (levelProId['1'] === levelProId['2']) {
                    abstinetions++;
                } else if (levelProId['1'] > levelProId['2']) {
                    proCandidate1++;
                } else {
                    proCandidate2++;
                }
            }
        });

        let forWinner = proCandidate1 / voterCount;
        let against = proCandidate2 / voterCount;
        if (proCandidate1 === proCandidate2) {
            winner = 'tie';
        } else if (proCandidate1 > proCandidate2) {
            winner = '1';
        } else {
            forWinner = proCandidate2 / voterCount;
            against = proCandidate1 / voterCount;
            winner = '2';
        }

        let result = {
            winner: winner,
            abstinentions: abstinetions,
            forWinner: forWinner,
            against: against,
            count1: proCandidate1,
            count2: proCandidate2
        };

        this.logF(JSON.stringify(result));
        this.stop();
    }

}