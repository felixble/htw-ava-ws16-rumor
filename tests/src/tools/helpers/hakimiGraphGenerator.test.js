
let expect = require('chai').expect;

import { HakimiGraphGenerator } from '../../../../src/tools/helpers/hakimiGraphGenerator';

describe('HakimiGraphGenerator', function() {

    describe('#generate', function() {

        it('generates a graph with different node degrees', function() {
            let hakimiGenerator = new HakimiGraphGenerator([4,3,3,3,1]);
            hakimiGenerator.generate();

            expect(hakimiGenerator.graph.getNodeDegreeFor(0)).to.equal(4);
            expect(hakimiGenerator.graph.getNodeDegreeFor(1)).to.equal(3);
            expect(hakimiGenerator.graph.getNodeDegreeFor(2)).to.equal(3);
            expect(hakimiGenerator.graph.getNodeDegreeFor(3)).to.equal(3);
            expect(hakimiGenerator.graph.getNodeDegreeFor(4)).to.equal(1);
        });

        it('generates a graph with a equal node degrees', function() {
            let hakimiGenerator = HakimiGraphGenerator.withEqualDegrees(6, 3, 3);
            hakimiGenerator.generate();

            expect(hakimiGenerator.graph.getNodeDegreeFor(3)).to.equal(3);
            expect(hakimiGenerator.graph.getNodeDegreeFor(4)).to.equal(3);
            expect(hakimiGenerator.graph.getNodeDegreeFor(5)).to.equal(3);
            expect(hakimiGenerator.graph.getNodeDegreeFor(6)).to.equal(3);
            expect(hakimiGenerator.graph.getNodeDegreeFor(7)).to.equal(3);
            expect(hakimiGenerator.graph.getNodeDegreeFor(8)).to.equal(3);
        });

    });

    describe('#sortDegreesDescending', function() {

        it('sorts the degrees array descending', function() {
            let hakimiGenerator = new HakimiGraphGenerator([3, 4, 9, 1]); // 0:3, 1:4, 2:9, 3:1
            hakimiGenerator.sortDegreesDescending();
            expect(hakimiGenerator.elements[0]).to.deep.equal({degree: 9, nodeId: 2});
            expect(hakimiGenerator.elements[1]).to.deep.equal({degree: 4, nodeId: 1});
            expect(hakimiGenerator.elements[2]).to.deep.equal({degree: 3, nodeId: 0});
            expect(hakimiGenerator.elements[3]).to.deep.equal({degree: 1, nodeId: 3});
        });

    });

});