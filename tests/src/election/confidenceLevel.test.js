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

    describe('#_getLevelById', function() {

        const LEVELS = [{id: 1, value: 1}, {id: 2, value: 2}];
        let confidenceLevel;

        beforeEach(function() {
            confidenceLevel = new ConfidenceLevel();
            confidenceLevel.level = LEVELS;
        });

        it('returns the correct level object', function() {
            let level = confidenceLevel._getLevelById(2);
            expect(level.id).to.equal(2);
            expect(level.value).to.equal(2);
        });

        it('throws for unknown ids', function() {
            let thrown = false;
            try {
                confidenceLevel._getLevelById(3);
            } catch (e) {
                thrown = true;
            }
            expect(thrown).to.be.true;
        });

    });

    describe('#isFavorite', function() {

        it('returns true for the candidate I am a supporter', function() {
            const MY_CANDIDATE = 1;
            let confidenceLevel = new ConfidenceLevel(MY_CANDIDATE);

            expect(confidenceLevel.isFavorite(MY_CANDIDATE)).to.be.true;
        });

    });

    describe('#updateLevelOnNewChooseMeMsg', function() {

        it('increases the value correctly', function() {
            const SENDER = 2;
            const INIT_VALUE = 65;
            const EXPECTED_RESULT = 71.5;
            let confidenceLevel = new ConfidenceLevel(false);

            confidenceLevel._getLevelById(SENDER).value = INIT_VALUE;
            confidenceLevel.updateLevelOnNewChooseMeMsg(SENDER);
            expect(confidenceLevel._getLevelById(SENDER).value).to.equal(EXPECTED_RESULT);
        });

        it('does not overstep 100', function() {
            const SENDER = 2;
            const EXPECTED_RESULT = 100;
            let confidenceLevel = new ConfidenceLevel(/*favourite candidate -> level = 100*/SENDER);

            confidenceLevel.updateLevelOnNewChooseMeMsg(SENDER);
            expect(confidenceLevel._getLevelById(SENDER).value).to.equal(EXPECTED_RESULT);
        });

    });

    describe('updateLevelOnNewCampaign', function() {

        const COMPETITOR = 1;
        const FAVOURITE = 2;

        let confidenceLevel;
        let init = (favouriteValue, competitorValue) => {
            confidenceLevel._getLevelById(FAVOURITE).value = favouriteValue;
            confidenceLevel._getLevelById(COMPETITOR).value = competitorValue;
        };

        beforeEach(function() {
            confidenceLevel = new ConfidenceLevel(false);
        });

        it('increases the value of the sender if he is my favourite candidate', function() {
            const EXPECTED_RESULT_FAV = 66;
            const EXPECTED_RESULT_COMPETITOR = 11;
            const INIT_VALUE_FAV = 65;
            const INIT_VALUE_COMPETITOR = 12;

            init(INIT_VALUE_FAV, INIT_VALUE_COMPETITOR);

            confidenceLevel.updateLevelOnNewCampaign(FAVOURITE);

            expect(confidenceLevel._getLevelById(FAVOURITE).value, 'sender should be increased')
                .to.equal(EXPECTED_RESULT_FAV);
            expect(confidenceLevel._getLevelById(COMPETITOR).value, 'competitor should be decreased')
                .to.equal(EXPECTED_RESULT_COMPETITOR);
        });

        it('decreases the value of the sender if he is NOT my favourite candidate', function() {
            const EXPECTED_RESULT_FAV = 66;
            const EXPECTED_RESULT_COMPETITOR = 11;
            const INIT_VALUE_FAV = 65;
            const INIT_VALUE_COMPETITOR = 12;

            init(INIT_VALUE_FAV, INIT_VALUE_COMPETITOR);

            confidenceLevel.updateLevelOnNewCampaign(COMPETITOR);

            expect(confidenceLevel._getLevelById(FAVOURITE).value, 'my favourite should be increased')
                .to.equal(EXPECTED_RESULT_FAV);
            expect(confidenceLevel._getLevelById(COMPETITOR).value, 'competitor should be decreased')
                .to.equal(EXPECTED_RESULT_COMPETITOR);
        });

        it('does nothing if both candidates have the same value', function() {
            const EXPECTED_RESULT_FAV = 51;
            const EXPECTED_RESULT_COMPETITOR = 51;
            const INIT_VALUE_FAV = 51;
            const INIT_VALUE_COMPETITOR = 51;

            init(INIT_VALUE_FAV, INIT_VALUE_COMPETITOR);

            confidenceLevel.updateLevelOnNewCampaign(COMPETITOR);

            expect(confidenceLevel._getLevelById(FAVOURITE).value, 'value of candidate one should not have changed')
                .to.equal(EXPECTED_RESULT_FAV);
            expect(confidenceLevel._getLevelById(COMPETITOR).value, 'value of candidate two should not have changed')
                .to.equal(EXPECTED_RESULT_COMPETITOR);
        });

    });

    describe('#_increaseLevelBy', function() {

        it('increases the value correctly', function() {
            const INIT_VAL = 13;
            const AMOUNT = 12;
            let level = {value: INIT_VAL};
            ConfidenceLevel._increaseLevelBy(AMOUNT, level);
            expect(level.value).to.equal(INIT_VAL + AMOUNT);
        });

        it('decreases the value correctly', function() {
            const INIT_VAL = 13;
            const AMOUNT = -12;
            let level = {value: INIT_VAL};
            ConfidenceLevel._increaseLevelBy(AMOUNT, level);
            expect(level.value).to.equal(INIT_VAL + AMOUNT);
        });

        it('does not overstep 100', function() {
            const INIT_VAL = 93;
            const AMOUNT = 10;
            let level = {value: INIT_VAL};
            ConfidenceLevel._increaseLevelBy(AMOUNT, level);
            expect(level.value).to.equal(100);
        });

        it('does not fall below 0', function() {
            const INIT_VAL = 12;
            const AMOUNT = -14;
            let level = {value: INIT_VAL};
            ConfidenceLevel._increaseLevelBy(AMOUNT, level);
            expect(level.value).to.equal(0);
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