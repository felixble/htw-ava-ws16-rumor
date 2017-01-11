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

    updateLevelOnNewChooseMeMsg(candidateId) {
        let level = this._getLevelById(candidateId);
        ConfidenceLevel._increaseLevelBy((level.value / 10), level);
    }

    updateLevelOnNewCampaign(candidateId) {
        let levelSender = this._getLevelById(candidateId);
        let levelCompetitor = this._getLevelById(CandidateIdsManager.getCompetitorCandidate(candidateId));

        if (levelSender.value > levelCompetitor.value) {
            ConfidenceLevel._increaseLevelBy(1, levelSender);
            ConfidenceLevel._increaseLevelBy(-1, levelCompetitor);
        } else if (levelSender.value < levelCompetitor.value) {
            ConfidenceLevel._increaseLevelBy(-1, levelSender);
            ConfidenceLevel._increaseLevelBy(1, levelCompetitor);
        }
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

    _getLevelById(id) {
        for(let i = 0; i < this.level.length; i++) {
            let level = this.level[i];
            if (level.id === id) {
                return level;
            }
        }

        throw new Error('illegal-state' , `Unknown candidate id ${id}`);
    }

    _addCandidate(id, level) {
        this.level.push({
            id: id,
            value: level
        });
    }

    static _increaseLevelBy(amount, level) {
        let tmp = level.value + amount;

        if (tmp >= 0 && tmp <= 100) {
            level.value = tmp;
        }
    }

    static _randomLevel() {
        let min = 0,
            max = 100;
        return Math.floor(Math.random()*(max-min+1)+min);
    }

}