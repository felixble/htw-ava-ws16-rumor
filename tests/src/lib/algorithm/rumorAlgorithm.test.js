let expect = require('chai').expect;
import sinon from 'sinon';

import { RumorAlgorithm } from '../../../../src/lib/algorithm/rumorAlgorithm';

describe('RumorAlgorithm', function() {

    describe('#processIncomingMessage', function() {

        /** @type {RumorAlgorithm} */
        let algorithm;
        let sendMsgCallback = sinon.stub();

        const MY_ID = 1;
        const MY_NEIGHBORS = [
            {id: 2},
            {id: 3}
        ];

        beforeEach(function() {
            algorithm = new RumorAlgorithm(MY_ID, MY_NEIGHBORS, sendMsgCallback);
        });

        afterEach(function() {
            sendMsgCallback.reset();
        });

        it('should distribute a new rumor to all neighbors', async function() {
            const MSG = 'hello';
            await algorithm.processIncomingMessage(MSG, -1);
            expect(sendMsgCallback.calledTwice).to.be.true;
        });

        it('should distribute a new rumor to all neighbors except the sending one', async function() {
            const MSG = 'hello';
            await algorithm.processIncomingMessage(MSG, 2);
            expect(sendMsgCallback.calledOnce).to.be.true;
        });

        it('should not distribute a rumor if the onNewIncomingRumor-Listener returns false', async function() {
            const MSG = 'hello';
            algorithm.setOnNewIncomingRumorListener(() => false);
            await algorithm.processIncomingMessage(MSG, 2);
            expect(sendMsgCallback.called).to.be.false;
        });

        it('should distribute a rumor if the onNewIncomingRumor-Listener returns true', async function() {
            const MSG = 'hello';
            algorithm.setOnNewIncomingRumorListener(() => true);
            await algorithm.processIncomingMessage(MSG, 2);
            expect(sendMsgCallback.calledOnce).to.be.true;
        });

    });



});