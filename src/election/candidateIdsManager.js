import { _ } from 'underscore';

const CANDIDATE_1 = 1;
const CANDIDATE_2 = 2;

export class CandidateIdsManager {

    static amIACandidate(myId) {
        return _.contains(CandidateIdsManager.getCandidateIds(), myId);
    }

    static getCompetitorCandidate(id) {
        return CandidateIdsManager.getCandidateIds().filter(candidate => {
            return candidate !== id;
        })[0];
    }

    static getCandidateIds() {
        return [CANDIDATE_1, CANDIDATE_2];
    }

}