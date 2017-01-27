let expect = require('chai').expect;
import sinon from 'sinon';

import { SnapshotAlgorithm } from '../../../../../src/lib/algorithm/snapshot/snapshotAlgorithm';
import { SnapshotMessageType } from '../../../../../src/lib/algorithm/snapshot/snapshotMessageTypes';
import { SnapshotMessageResponse } from '../../../../../src/lib/algorithm/snapshot/snapshotMessageTypes';

class VectorClock {
    updateTimeForId() {}
}

describe('SnapshotAlgorithm', function() {

    const MY_ENDPOINT = {
        id: '0',
        host: 'localhost',
        port: 3999
    }, NODES = [{id: 1}, {id: 2}];

    let snapshot,
        vectorClock = new VectorClock(),
        vectorClockStub = sinon.stub(vectorClock, 'updateTimeForId');

    beforeEach(function() {
        snapshot = new SnapshotAlgorithm(MY_ENDPOINT, NODES, vectorClock);
        snapshot.setSendMsgCallback(sinon.stub());
    });

    afterEach(function() {
        snapshot.sendMsgCallback.reset();
        vectorClockStub.reset();
    });

    describe('#_collectVectorTimestamps', function() {
        beforeEach(function() {
            snapshot._sendMsg = sinon.stub();
        });
        afterEach(function() {
            snapshot._sendMsg.reset();
        });

        it('should send query the local timestamp of each node', async function() {
            await snapshot._collectVectorTimestamps();
            expect(snapshot._sendMsg.callCount).to.equal(NODES.length);
            expect(snapshot._sendMsg.alwaysCalledWithMatch(sinon.match.any, SnapshotMessageType.REQUEST_LOCAL_VECTOR_TIMESTAMP))
                .to.be.true;
        });

    });

    describe('#_calculateSnapshotTimestamp', function() {

        const MAX_TIMESTAMP = NODES.length * 2,
              CONSTANT_FACTOR = 10;

        beforeEach(function() {
            snapshot.nodes = NODES.map((node, i) => {
                let timestamp = (i+1) * 2;
                return {id: node.id, timestamp: timestamp};
            });
            snapshot.constantFactorToAddToMaxTimestamp = CONSTANT_FACTOR;
        });
        afterEach(function() {
            snapshot.nodes = NODES;
        });

        it('should add a constant value to the maximum value of the local timestamps of each node', function() {
            snapshot._calculateSnapshotTimestamp();
            let expected = MAX_TIMESTAMP + CONSTANT_FACTOR;
            expect(snapshot.snapshotTimestamp).to.equal(expected);
        });

    });

    describe('#_distributeSnapshotTimestamp', function() {

        const SNAPSHOT_TIMESTAMP = 4711;
        beforeEach(function() {
            snapshot.snapshotTimestamp = SNAPSHOT_TIMESTAMP;
            snapshot._sendMsg = sinon.stub();
        });
        afterEach(function() {
            snapshot.snapshotTimestamp = 0;
            snapshot._sendMsg.reset();
        });

        it('sends the snapshot timestamp to all nodes', async function() {
            snapshot._sendMsg.returns(SnapshotMessageResponse.VALID_SNAPSHOT_TIMESTAMP);
            await snapshot._distributeSnapshotTimestamp();
            expect(snapshot._sendMsg.callCount).to.equal(NODES.length);
            expect(snapshot._sendMsg.alwaysCalledWithMatch(sinon.match.any, SnapshotMessageType.TAKE_SNAPSHOT_AT, SNAPSHOT_TIMESTAMP))
                .to.be.true;
        });

    });

    describe('#_manipulateVectorClock', function() {

        const SNAPSHOT_TIMESTAMP = 4711;
        beforeEach(function() {
            snapshot.snapshotTimestamp = SNAPSHOT_TIMESTAMP;
        });
        afterEach(function() {
            snapshot.snapshotTimestamp = 0;
        });

        it('sets the snapshot timestamp as local time for each node in the vector clock by calling the update method ' +
            'of the vector clock', function()
        {
            snapshot._manipulateVectorClock();
            expect(vectorClockStub.callCount).to.equal(NODES.length);
            expect(vectorClockStub.alwaysCalledWithMatch(sinon.match.any, SNAPSHOT_TIMESTAMP)).to.be.true;
        });

    });

    describe('#_distributeManipulatedTimestamp', function() {
        beforeEach(function() {
            snapshot._sendMsg = sinon.stub();
        });
        afterEach(function() {
            snapshot._sendMsg.reset();
        });

        it('distributes the timestamp by sending a update-vector-clock msg to all nodes', async function() {
            await snapshot._distributeManipulatedTimestamp();
            expect(snapshot._sendMsg.callCount).to.equal(NODES.length);
            expect(snapshot._sendMsg.alwaysCalledWithMatch(sinon.match.any, SnapshotMessageType.UPDATE_VECTOR_CLOCK, ''));
        });
    });

    describe('#_sendMsg', function() {

        it('should call the callback once', async function() {
            snapshot._sendMsg();
            expect(snapshot.sendMsgCallback.calledOnce).to.be.true;
        });

        it('should call the callback with the correct parameters', async function() {
            const node = {id: 5, host: 'localhost', port: 4711};
            const type = 'MSG_TYPE';
            const content = 'content';
            snapshot._sendMsg(node, type, content);
            const expectedMsg = {
                content: content,
                snapshotTaker: MY_ENDPOINT,
                type: type
            };
            expect(snapshot.sendMsgCallback.calledWithExactly(node, expectedMsg)).to.be.true;
        });


    });



});