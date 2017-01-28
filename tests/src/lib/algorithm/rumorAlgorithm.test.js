let expect = require('chai').expect;
import sinon from 'sinon';

import { RumorAlgorithm } from '../../../../src/lib/algorithm/rumorAlgorithm';

describe('RumorAlgorithm', function() {

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

    describe('#distributeRumor', function() {

        it('should distribute the rumor to all neighbors', async function() {
            const MSG = 'hello';
            await algorithm.distributeRumor(MSG);
            expect(sendMsgCallback.calledTwice).to.be.true;
        });

        it('it should distribute the rumor to all neighbors except the ones where the callback function returns false',
            async function()
        {
            const MSG = 'hello';
            await algorithm.distributeRumor(MSG, (id) => { return id === 3; });
            expect(sendMsgCallback.calledOnce).to.be.true;
        });

    });


    describe('#processIncomingMessage', function() {

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

        it('calls the onMessageProcessed-Callback', async function() {
            const MSG = 'hello';
            let listener = sinon.stub();
            algorithm.setOnNewIncomingRumorListener(listener);
            await algorithm.processIncomingMessage(MSG, 2);
            expect(listener.calledOnce).to.be.true;
            expect(listener.calledWithExactly(MSG, algorithm.currentRumorId)).to.be.true;
            listener.reset();
        });

    });

    describe('#getRumorByText', function() {

        it('returns a specific rumor', function() {
            const RUMOR = 'rumor';
            sinon.stub(algorithm, 'getRumorIndexByText');
            algorithm.getRumorIndexByText.returns(0);

            algorithm.rumors.push(RUMOR);
            expect(algorithm.getRumorByText(RUMOR)).to.equal(RUMOR);
            expect(algorithm.getRumorIndexByText.calledOnce).to.be.true;
            expect(algorithm.getRumorIndexByText.calledWithExactly(RUMOR)).to.be.true;

            algorithm.getRumorIndexByText.restore();
        });

    });

    describe('#addRumor', function() {

        it('does not add an already known rumor but adds the source id instead', function() {
            const RUMOR = 'rumor';
            algorithm.addRumor(RUMOR, 'me');
            algorithm.addRumor(RUMOR, 'you');
            expect(algorithm.rumors).to.have.length(1);
            expect(algorithm.rumors[0].from).to.have.length(2);
        });

    });

    describe('#toldMe', function() {

        it('returns false for unknown rumors', function() {
            expect(algorithm.toldMe('unknown', 'source')).to.be.false;
        });

    });


});