let expect = require('chai').expect;
import sinon from 'sinon';

import { SnapshotState, STATES } from '../../../../../src/lib/algorithm/snapshot/snapshotState';


describe('SnapshotState', function() {


    describe('#constructor', function() {
        it('should should initialize the object correctly', function() {
            let state = new SnapshotState();
            expect(state.state).to.equal(STATES.IDLE);
            expect(state.responseCount).to.equal(0);
            expect(state.expectedResponsesCount).to.equal(0);
        });
    });

    describe('#incomingResponse', function() {

        it('should throw if the current state is IDLE', function() {
            let threwException = false,
                state = new SnapshotState();
            state.state = STATES.IDLE;
            try {
                state.incomingResponse(false);
                threwException = false;
            } catch(ignored) { threwException = true; }
            expect(threwException).to.be.true;
        });

        it('should throw if the current state is CALCULATE_SNAPSHOT_TIMESTAMP', function() {
            let threwException = false,
                state = new SnapshotState();
            state.state = STATES.CALCULATE_SNAPSHOT_TIMESTAMP;
            try {
                state.incomingResponse(false);
                threwException = false;
            } catch(ignored) { threwException = true; }
            expect(threwException).to.be.true;
        });

        it('does not change state if #responses is below #expectedResponses', function() {
            let state = new SnapshotState();
            state.state = STATES.COLLECT_TIMESTAMPS;
            state.responseCount = 1;
            state.expectedResponsesCount = 3;

            state.incomingResponse(false);

            expect(state.state).to.equal(STATES.COLLECT_TIMESTAMPS);
            expect(state.responseCount).to.equal(2);
        });

        it('performs a state transition if the expected amount of responses will be reached', function() {
            let state = new SnapshotState();
            state.state = STATES.COLLECT_TIMESTAMPS;
            state.responseCount = 2;
            state.expectedResponsesCount = 3;

            state.incomingResponse(false);

            expect(state.state).to.equal(STATES.CALCULATE_SNAPSHOT_TIMESTAMP);
        });

        it('performs a state transition to the previous state if reset-parameter is true at least once', function() {
            let state = new SnapshotState();
            state.state = STATES.DISTRIBUTE_SNAPSHOT_TIMESTAMP;
            state.responseCount = 1;
            state.expectedResponsesCount = 3;

            state.incomingResponse(true);
            state.incomingResponse(false);

            expect(state.state).to.equal(STATES.CALCULATE_SNAPSHOT_TIMESTAMP);
            expect(state.responseCount).to.equal(3);
        });

    });



});