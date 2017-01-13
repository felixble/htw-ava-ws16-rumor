let expect = require('chai').expect;

import { Random } from '../../../src/lib/random';


let endpointParser = require('../../../src/parser/endpointParser');

describe('Random', function() {

    describe('#randomBoolean', function() {

        it('returns true or false', function() {
            let res = Random.randomBoolean();
            expect(res === true || res === false).to.be.true;
        });

        it('does not always return only true/false', function() {
            let trueCount = 0,
                falseCount = 0;

            for (let i=0; i<100; i++) {
                let res = Random.randomBoolean();
                if (res) trueCount++;
                else falseCount++;
            }

            expect(trueCount).to.be.above(0);
            expect(falseCount).to.be.above(0);

            expect(trueCount).to.be.above(39);
            expect(trueCount).to.be.below(61);
            console.log(`${trueCount} ${falseCount}`);
        });

    });

});