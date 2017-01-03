let expect = require('chai').expect;

import { VectorClock } from '../../../src/lib/vector-clock';

describe('VectorClock', function() {

    const MY_ID = 1;

    /** @var VectorClock */
    let vectorClock;

    beforeEach(function() {
        vectorClock = new VectorClock(MY_ID);
    });

    it('ticks correctly', function() {
        expect(vectorClock.getMyTime(), 'VectorTime has correct init value').to.equal(0);
        vectorClock.tick();
        expect(vectorClock.getMyTime(), 'VectorTime increments the time value correctly').to.equal(1);
        vectorClock.tick();
        expect(vectorClock.getMyTime(), 'VectorTime increments the time value a 2nd time correctly').to.equal(2);
    });

    it('updates its vector correctly which is empty initially', function() {
        const OTHER_ID = 2;
        let otherClock = new VectorClock(OTHER_ID);
        otherClock.tick();
        otherClock.tick();
        otherClock.tick();

        vectorClock.update(otherClock);
        expect(vectorClock.vector ,'My clock should have now two elements.').to.have.length(2);
        expect(vectorClock.getMyTime(), 'My time should not been changed').to.equal(0);
        expect(vectorClock.getTimeFor(OTHER_ID), 'The other time should have been updated').to.equal(3);
    });

    it('updates its vector with the maximum value', function() {
        const OTHER_ID = 2,
            OTHER_ID_2 = 3;
        let otherClock = new VectorClock(OTHER_ID);
        let otherClock2 = new VectorClock(OTHER_ID_2);
        otherClock2.tick();
        otherClock.tick();
        otherClock.tick();
        otherClock.tick();

        otherClock2.update(otherClock);
        vectorClock.update(otherClock2);
        expect(vectorClock.vector ,'My clock should have now three elements.').to.have.length(3);
        expect(vectorClock.getMyTime(), 'My time should not been changed').to.equal(0);
        expect(vectorClock.getTimeFor(OTHER_ID), 'The other time should have been updated').to.equal(3);
        expect(vectorClock.getTimeFor(OTHER_ID_2), 'The 2nd other time should have been updated, too').to.equal(1);

        otherClock.tick();
        vectorClock.update(otherClock.vector); // check if array can be passed to update method, too.
        expect(vectorClock.getMyTime(), 'My time should not been changed').to.equal(0);
        expect(vectorClock.getTimeFor(OTHER_ID), 'The other time should have been updated a 2nd time').to.equal(4);
        expect(vectorClock.getTimeFor(OTHER_ID_2), 'The 2nd other time should have not been updated').to.equal(1);
    });

});