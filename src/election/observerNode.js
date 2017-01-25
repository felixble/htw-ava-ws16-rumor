import { _ } from 'underscore';
import { ServerLogic } from '../serverLogic';
import { CandidateIdsManager } from './candidateIdsManager';
import { SnapshotAlgorithm } from '../lib/algorithm/snapshot/snapshotAlgorithm';
import { MessageTypes } from './messageTypes';

export class ObserverNode extends ServerLogic {

    constructor(server, endpointManager) {
        super(server, endpointManager);
        this.snapshotAlgorithm = new SnapshotAlgorithm(
            endpointManager.getMyEndpoint(), endpointManager.getMyNeighbors(), this.myVectorTime);
        this.snapshotAlgorithm.setSendMsgCallback(_.bind(this.sendSnapshotMsg, this))
    }

    async _runAlgorithm(data, socket) {
        let type = data.type;
        switch(type) {
            case 'take-snapshot':
                await this.takeSnapshot();
                this.logI('Taken snapshot successfully, waiting for messages from nodes');
                break;
            case MessageTypes.MY_STATUS:

                console.log(data.msg);
                break;

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

}