
let expect = require('chai').expect;

import { GraphGenerator } from '../../../../src/tools/helpers/graphGenerator';

describe('GraphGenerator', function() {

    describe('#generate', function() {

        it('can generate a graph', function() {
            const NODE_COUNT = 6;
            const DEGREE = 3;
            let generator = new GraphGenerator(NODE_COUNT, DEGREE);
            generator.generate();
            console.log(JSON.stringify(generator.graph));
        });
    });


});