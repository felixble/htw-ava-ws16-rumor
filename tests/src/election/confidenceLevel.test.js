let expect = require('chai').expect;

import { ConfidenceLevel } from '../../../src/election/confidenceLevel';


describe('ConfidenceLevel', function() {

    describe('#constructor', function() {

        it('sets the confidence level for a supporter correctly', function() {
            const MY_CANDIDATE = 1;
            let confidenceLevel = new ConfidenceLevel(MY_CANDIDATE);

            expect(confidenceLevel.level, 'should have two level entries').to.have.length(2);
            expect(confidenceLevel.level, 'should contain the correct level for my candidate').to.contain({id: 1, value: 100});
            expect(confidenceLevel.level, 'should contain the correct level for the other candidate').to.contain({id: 2, value: 0});
        });


        it('generates random confidence level values for non-supporter', function() {
            let confidenceLevel = new ConfidenceLevel(false);

            expect(confidenceLevel.level, 'should have to level entries').to.have.length(2);
            for(let i = 0; i < confidenceLevel.level.length; i++) {
                let value = confidenceLevel.level[i].value;
                expect(value, 'level value is less than 0').to.be.above(-1);
                expect(value, 'level value is bigger than 100').to.be.below(101);
            }
        });

    });

    describe('#_randomLevel', function() {

        it('generates a random number between 0 and 100 (inclusive)', function() {

            for(let i = 0; i < 200; i++) {
                let rand = ConfidenceLevel._randomLevel();
                expect(rand, 'random value is less than 0').to.be.above(-1);
                expect(rand, 'random value is bigger than 100').to.be.below(101);
            }

        });

    });



});