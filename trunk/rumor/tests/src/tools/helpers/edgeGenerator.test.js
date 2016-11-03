let expect = require('chai').expect;

import { EdgeGenerator } from '../../../../src/tools/helpers/edgeGenerator';

describe('EdgeGenerator', function() {

    let edgeGenerator;

    it('creates an array of edges', function() {
        edgeGenerator = new EdgeGenerator(4, 5);
        let edges = edgeGenerator.createEdges();

        expect(edges, 'should create 5 edges').to.have.length(5);

        for (let i = 0; i < 5; i++) {
            expect(edges[i][0]).to.be.above(0);
            expect(edges[i][0]).to.be.below(5);
            expect(edges[i][1]).to.be.above(0);
            expect(edges[i][1]).to.be.below(5);
        }
    });

    it('creates another edges array', function() {
        const mEdges = 8;
        const nNodes = 6;
        const maxNode = nNodes + 1;
        edgeGenerator = new EdgeGenerator(nNodes, mEdges);
        let edges = edgeGenerator.createEdges();

        expect(edges, 'should create 8 edges').to.have.length(mEdges);

        for (let i = 0; i < 8; i++) {
            expect(edges[i][0]).to.be.above(0);
            expect(edges[i][0]).to.be.below(maxNode);
            expect(edges[i][1]).to.be.above(0);
            expect(edges[i][1]).to.be.below(maxNode);
        }
    });

    it('returns a random number', function() {
        for (let i = 2; i < 25; i++) {
            let r = EdgeGenerator._rand(i);
            let r2 = EdgeGenerator._rand(i);
            expect(r).to.be.above(0);
            expect(r).to.be.below(i);
            expect(r2).to.be.above(0);
            expect(r2).to.be.below(i);
        }
    });

    it('generates the graphviz data from a nodes array', function() {
        const edges = [[1,2],[3,2],[4,2],[4,3],[5,1],[5,3]];
        edgeGenerator = new EdgeGenerator(4, 5);
        edgeGenerator.edges = edges;
        let data = edgeGenerator.generateGraphvizData(edges);
        expect(data).to.equal('graph G {\n1 -- 2;\n3 -- 2;\n4 -- 2;\n4 -- 3;\n5 -- 1;\n5 -- 3;\n}');
    });

    it('checks if an edge-arrays contains an edge correctly', function() {
        const edges = [[1,2],[3,2],[4,2],[4,3],[5,1],[5,3]];
        edgeGenerator = new EdgeGenerator(4, 5);
        edgeGenerator.edges = edges;
        expect(edgeGenerator._containsEdge([4,2])).to.be.true;
        expect(edgeGenerator._containsEdge([2,4])).to.be.true;
        expect(edgeGenerator._containsEdge([5,2])).to.be.false;
    });

});