import { ServerLogic } from '../serverLogic';
import { CandidateIdsManager } from './candidateIdsManager';

export class ObserverNode extends ServerLogic {

    constructor(server, endpointManager, electionTime) {
        super(server, endpointManager);
        this.electionTime = electionTime;
    }

}