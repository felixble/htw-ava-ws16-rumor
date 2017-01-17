import { CandidateIdsManager } from './candidateIdsManager';
import { Random } from '../lib/random';

export class ConfidenceLevel {

    constructor(myCandidate) {
        if (!myCandidate) {
            myCandidate = false;
        }
        this.myCandidatesId = myCandidate;
        this.level = [];
        this._init()
    }

    isFavorite(candidateId) {
        console.log('#isFavorite');
        console.log(JSON.stringify(this.level));
        let levelCandidate = this._getLevelById(candidateId);
        let levelCompetitor = this._getLevelById(CandidateIdsManager.getCompetitorCandidate(candidateId));
        return levelCandidate.value > levelCompetitor.value;
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
        if (this.myCandidatesId) {
            this._addCandidate(this.myCandidatesId, 100);
            this._addCandidate(CandidateIdsManager.getCompetitorCandidate(this.myCandidatesId), 0);
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
        console.log(JSON.stringify(this.level));
        throw new Error(`illegal-state: Unknown candidate id ${id}`);
    }

    _addCandidate(id, level) {
        this.level.push({
            id: id,
            value: level
        });
    }

    static _increaseLevelBy(amount, level) {
        let tmp = level.value + amount;

        if (tmp < 0) {
            level.value = 0;
        } else if (tmp > 100) {
            level.value = 100;
        } else {
            level.value = tmp;
        }
    }

    static _randomLevel() {
        return Random.randomNumber(0, 100);
    }

}