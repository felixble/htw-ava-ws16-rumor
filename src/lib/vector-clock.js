
export class VectorClock {

    /**
     * @typedef {Object} VectorTimeElement
     * @property id
     * @property {number} time
     */

    /**
     *
     * @param myId
     */
    constructor(myId) {
        this.myId = myId;
        /** @var {VectorTimeElement[]} */
        this.vector = [];
        this._addVectorTime(myId);
    }

    tick() {
        let i = this._getMyIndex();
        this.vector[i].time++;
    }

    /**
     *
     * @param {VectorClock|VectorTimeElement[]} clock
     */
    update(clock) {
        let vector = (clock.hasOwnProperty('vector')) ? clock.vector : clock;
        for(let i=0; i<vector.length; i++) {
            let o = vector[i];
            this._setMax(o.id, o.time);
        }
    }

    getMyTime() {
        let i = this._getMyIndex();
        return this.vector[i].time;
    }

    getTimeFor(id) {
        let i = this._findIndex(id);
        if (undefined === i) { return 0; }
        return this.vector[i].time;
    }

    _getMyIndex() {
        let i = this._findIndex(this.myId);
        if (undefined === i) {
            throw new Error('Illegal state - Own id of VectorClock is not set.');
        }
        return i;
    }

    _addVectorTime(id, initialValue = 0) {
        this.vector.push({id: id, time: initialValue});
    }

    _setMax(id, cmpTime) {
        let i = this._findIndex(id);
        if (undefined === i) {
            this._addVectorTime(id, cmpTime);
        } else {
            this.vector[i].time = Math.max(this.vector[i].time, cmpTime);
        }
    }

    _findIndex(id) {
        for (let i=0; i<this.vector.length; i++) {
            let o = this.vector[i];
            if (o.id === id) {
                return i;
            }
        }
        return undefined;

    }

}