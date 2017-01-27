
export const STATES = {
    IDLE: 'idle',
    COLLECT_TIMESTAMPS: 'collect-timestamps',
    CALCULATE_SNAPSHOT_TIMESTAMP: 'calculate-snapshot-timestamp',
    DISTRIBUTE_SNAPSHOT_TIMESTAMP: 'distribute-snapshot-timestamp',
    TIMESTAMP_DISTRIBUTED: 'timestamp-distributed',
    COLLECT_NODE_STATE: 'collect-node-state',
    FINISHED: 'finished',

    next: function(state) {
        switch(state) {
            case this.IDLE:
                return this.COLLECT_TIMESTAMPS;
            case this.COLLECT_TIMESTAMPS:
                return this.CALCULATE_SNAPSHOT_TIMESTAMP;
            case this.CALCULATE_SNAPSHOT_TIMESTAMP:
                return this.DISTRIBUTE_SNAPSHOT_TIMESTAMP;
            case this.DISTRIBUTE_SNAPSHOT_TIMESTAMP:
                return this.TIMESTAMP_DISTRIBUTED;
            case this.TIMESTAMP_DISTRIBUTED:
                return this.COLLECT_NODE_STATE;
            case this.COLLECT_NODE_STATE:
                return this.FINISHED;
            default:
                throw new Error(`Illegal-state - unknown next state for ${state}`);
        }
    },

    prev: function(state) {
        switch(state) {
            case this.DISTRIBUTE_SNAPSHOT_TIMESTAMP:
                return this.CALCULATE_SNAPSHOT_TIMESTAMP;
            default:
                throw new Error(`Illegal-state - unknown previous state for ${state}`);
        }
    }
};

export class SnapshotState {


    constructor() {
        this.state = STATES.IDLE;
        this.responseCount = 0;
        this.expectedResponsesCount = 0;
    }

    incomingResponse(reset) {
        if (this.state === STATES.IDLE || this.state === STATES.CALCULATE_SNAPSHOT_TIMESTAMP
            || this.state === STATES.TIMESTAMP_DISTRIBUTED || this.state === STATES.FINISHED
        ) {
            throw new Error(`Illegal-state - cannot process incoming response in state ${this.state}`);
        }

        if (reset)  {
            this.responseCount = 0;
            this._prevState();
        } else {
            this.responseCount++;
            if (this.responseCount === this.expectedResponsesCount) {
                this._nextState();
            }
        }
    }

    waitForResponses(expectedResponsesCount) {
        if (this.state === STATES.COLLECT_TIMESTAMPS || this.state === STATES.DISTRIBUTE_SNAPSHOT_TIMESTAMP
            || this.state === STATES.COLLECT_NODE_STATE || this.state === STATES.FINISHED
        ) {
            throw new Error(`Illegal-state - cannot wait for responses in state ${this.state}`);
        }
        this.responseCount = 0;
        this.expectedResponsesCount = expectedResponsesCount;
        this._nextState();
    }

    isReceivingTimestamps() {
        return this.state === STATES.COLLECT_TIMESTAMPS;
    }

    isReceivingAcknowledgments() {
        return this.state === STATES.DISTRIBUTE_SNAPSHOT_TIMESTAMP;
    }

    isReceivingStates() {
        return this.state === STATES.COLLECT_NODE_STATE;
    }

    isWaiting() {
        return (this.state === STATES.IDLE
                || this.state === STATES.COLLECT_TIMESTAMPS
                || this.state === STATES.DISTRIBUTE_SNAPSHOT_TIMESTAMP
                || this.state === STATES.COLLECT_NODE_STATE);
    }

    isCalculateSnapshotTimestamp() {
        return this.state === STATES.CALCULATE_SNAPSHOT_TIMESTAMP;
    }

    isTimestampDistributed() {
        return this.state === STATES.TIMESTAMP_DISTRIBUTED;
    }

    isFinished() {
        return this.state === STATES.FINISHED;
    }

    _nextState() {
        this.state = STATES.next(this.state);
    }

    _prevState() {
        this.state = STATES.prev(this.state);
    }
}