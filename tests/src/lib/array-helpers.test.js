let expect = require('chai').expect;

import { ArrayHelpers } from '../../../src/lib/array-helpers';

describe('ArrayHelpers', function() {

    describe('#findElementById', function() {

        const ARRAY = [
            {id: 47, value: '47'},
            {id: 11, value: '11'},
            {id: 17, value: '17'},
            {id: 13, value: '13'}
        ];

        it('returns the correct object', function() {
            expect(ArrayHelpers.findElementById(ARRAY, 11)).to.equal(ARRAY[1]);
        });

    });

});