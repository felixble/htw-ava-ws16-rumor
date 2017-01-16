let expect = require('chai').expect;

import { EchoStates } from '../../../../src/lib/algorithm/echoStates';

describe('EchoStates', function() {

    let echoStates;

    beforeEach(function() {
        echoStates = new EchoStates();
    });

    it('adds a new state to the states map correctly', function() {
        const myId = '4711';
        echoStates.add(myId);

        expect(echoStates.states, 'states array should have one entry').to.have.length(1);
        expect(echoStates.map, 'map array should have one entry, too').to.have.length(1);
    });

    it('can fetch a state by a given id', function() {
        const beRed = '4711';
        const beGreen = '4712';
        echoStates.add(beRed);
        echoStates.add(beGreen);

        echoStates.get(beRed).setRed();
        echoStates.get(beGreen).setGreen();

        expect(echoStates.get(beGreen).isGreen()).to.be.true;
        expect(echoStates.get(beRed).isRed()).to.be.true;

        expect(echoStates.get(beGreen).isWhite()).to.be.false;
        expect(echoStates.get(beRed).isGreen()).to.be.false;
    });

});