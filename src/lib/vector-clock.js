import { _ } from 'underscore'

/**
 * Implementation of a vector clock which is a
 * logical time.
 */
export class VectorClock {

    /**
     * @typedef {Object} VectorTimeElement
     * @property id
     * @property {number} time
     */

    static createFromJSON(json) {
        let clock = new VectorClock(json.myId);
        clock.vector = json.vector;
        return clock;
    }

    /**
     * Creates a new vector clock and defines the
     * id of the local node. The counter identified by
     * this id will be increased whenever the {@link VectorClock#tick}
     * method will be called.
     *
     * @param myId identifier for this local node.
     */
    constructor(myId) {
        this.myId = myId;
        /** @var {VectorTimeElement[]} */
        this.vector = [];
        this._addVectorTime(myId);
    }

    /**
     * Increases the local event counter.
     */
    tick() {
        let i = this._getMyIndex();
        this.vector[i].time++;
    }

    toString() {
        return JSON.stringify(this.vector);
    }

    toJSON() {
        return _.extend({}, this);
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

    /**
     * Gets the local event counter.
     *
     * @returns {number} current local event counter
     */
    getMyTime() {
        let i = this._getMyIndex();
        return this.vector[i].time;
    }

    /**
     * Gets the event counter for a specific id.
     *
     * @param id identifier of the network node
     * @returns {number} event counter for the given id.
     */
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