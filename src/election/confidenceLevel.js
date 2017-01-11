import { CandidateIdsManager } from './candidateIdsManager';

export class ConfidenceLevel {

    constructor(myCandidate) {
        if (!myCandidate) {
            myCandidate = false;
        }
        this.myCandidate = myCandidate;
        this.level = [];
        this._init()
    }

    _init() {
        if (this.myCandidate) {
            this._addCandidate(this.myCandidate, 100);
            this._addCandidate(CandidateIdsManager.getCompetitorCandidate(this.myCandidate), 0);
        } else {
            CandidateIdsManager.getCandidateIds().forEach(candidate => {
                this._addCandidate(candidate, this.constructor._randomLevel());
            });
        }
    }

    _addCandidate(id, level) {
        this.level.push({
            id: id,
            value: level
        });
    }

    static _randomLevel() {
        let min = 0,
            max = 100;
        return Math.floor(Math.random()*(max-min+1)+min);
    }

}