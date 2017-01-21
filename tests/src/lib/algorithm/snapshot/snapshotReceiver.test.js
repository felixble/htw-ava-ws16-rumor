let expect = require('chai').expect;
import sinon from 'sinon';

import { SnapshotReceiver } from '../../../../../src/lib/algorithm/snapshot/snapshotReceiver';
import { SnapshotMessageType } from '../../../../../src/lib/algorithm/snapshot/snapshotMessageTypes';
import { SnapshotMessageResponse } from '../../../../../src/lib/algorithm/snapshot/snapshotMessageTypes';

class VectorClock {
    getMyTime() {}
}

describe('SnapshotReceiver', function() {

    const MY_TIME = 3;

    let snapshotReceiver,
        vectorClock = new VectorClock(),
        vectorClockStub = sinon.stub(vectorClock, 'getMyTime');

    beforeEach(function() {
        vectorClockStub.returns(MY_TIME);
        snapshotReceiver = new SnapshotReceiver(vectorClock);
    });
    afterEach(function() {
        vectorClockStub.reset();
    });

    describe('#processIncomingMessage', function() {
        const SNAPSHOT_TAKER = {id: 0, host: 'local', port: 3999};
        const SNAPSHOT_TIMESTAMP = 4711;

        it('overwrites the snapshotTaker on every incoming msg', function() {
            let types = [
                SnapshotMessageType.GET_LOCAL_VECTOR_TIMESTAMP,
                SnapshotMessageType.TAKE_SNAPSHOT_AT,
                SnapshotMessageType.UPDATE_VECTOR_CLOCK
            ];
            types.forEach((type) => {
                let msg = {content: '', snapshotTaker: SNAPSHOT_TAKER, type: type};
                snapshotReceiver.processIncomingMessage(msg);
                expect(snapshotReceiver.snapshotTaker).to.equal(SNAPSHOT_TAKER);
            });
        });

        it('does not overwrite the snapshotTaker if the incoming msg does not provide one', function() {
            snapshotReceiver.snapshotTaker = SNAPSHOT_TAKER;
            let msg = {content: '', snapshotTaker: null, type: SnapshotMessageType.GET_LOCAL_VECTOR_TIMESTAMP};
            snapshotReceiver.processIncomingMessage(msg);
            expect(snapshotReceiver.snapshotTaker).to.equal(SNAPSHOT_TAKER);
        });

        it('should handle a get-local-vector-timestamp msg correctly', function() {
            let type = SnapshotMessageType.GET_LOCAL_VECTOR_TIMESTAMP;
            let msg = {content: '', snapshotTaker: SNAPSHOT_TAKER, type: type};
            let result = snapshotReceiver.processIncomingMessage(msg);
            expect(result).to.deep.equal(MY_TIME);
        });

        it('should handle a take-snapshot-at msg correctly', function() {
            let type = SnapshotMessageType.TAKE_SNAPSHOT_AT;
            let msg = {content: SNAPSHOT_TIMESTAMP.toString(), snapshotTaker: SNAPSHOT_TAKER, type: type};
            let result = snapshotReceiver.processIncomingMessage(msg);
            expect(result).to.be.not.false;
            expect(snapshotReceiver.snapshotTimestamp).to.deep.equal(SNAPSHOT_TIMESTAMP);
        });

        it('should handle a update-vector-clock msg correctly', function() {
            let type = SnapshotMessageType.UPDATE_VECTOR_CLOCK;
            let msg = {content: '', snapshotTaker: SNAPSHOT_TAKER, type: type};
            let result = snapshotReceiver.processIncomingMessage(msg);
            expect(result).to.be.not.false;
        });

        it('should return an error by unknown message types', function() {
            let type = 'unknown';
            let msg = {content: '', snapshotTaker: SNAPSHOT_TAKER, type: type};
            let result = snapshotReceiver.processIncomingMessage(msg);
            expect(result).to.have.ownProperty('error');
        });

    });
});