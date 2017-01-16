const STATE = {
    WHITE: 1,
    RED: 2,
    GREEN: 3
};

class EchoState {

    constructor() {
        this.firstNeighborId = null;
        this.counter = 0;
        this.initiator = false;
        this.onEchoDistributed = null;
        this.message = null;
        this.reset();
    }

    isWhite() { return this.state === STATE.WHITE; }
    isRed() { return this.state === STATE.RED; }
    isGreen() { return this.state === STATE.GREEN; }

    setRed() { this.state = STATE.RED; }
    setGreen() { this.state = STATE.GREEN; }

    setFirstNeighborId(id) {
        this.firstNeighborId = id;
    }

    getFirstNeighborId() {
        return this.firstNeighborId;
    }

    incCounter() {
        this.counter++;
    }

    getCounter() {
        return this.counter;
    }

    reset() {
        this.counter = 0;
        this.state = STATE.WHITE;
    }

}

export class EchoStates {

    constructor() {
        this.states = [];
        this.map = [];
    }

    add(id) {
        let l = this.states.push(new EchoState());
        let l2 = this.map.push(id);
        if (l !== l2) {
            throw new Error('illegal-state', 'length of states and map array is not equal');
        }
        return (l-1);
    }

    /**
     *
     * @param id
     * @returns {EchoState}
     */
    get(id) {
        let i = 0;
        let hasEntry = this.map.some((entry) => {
            if (entry === id) { return true; }
            i++;
            return false;
        });
        if (!hasEntry) {
            i = this.add(id);
        }
        return this.states[i];
    }

}