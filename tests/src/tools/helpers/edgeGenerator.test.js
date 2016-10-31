let expect = require('chai').expect;

let edgeGenerator = require('../../../../src/tools/helpers/edgeGenerator');

describe('graphgen', function() {

    it('creates a edges array', function() {
        let edges = edgeGenerator.createEdges(3, 4);

        expect(edges, 'should create 4 edges').to.have.length(4);

        for (let i = 0; i < 4; i++) {
            expect(edges[i][0]).to.be.above(0);
            expect(edges[i][0]).to.be.below(4);
            expect(edges[i][1]).to.be.above(0);
            expect(edges[i][1]).to.be.below(4);
        }
    });

    it('creates another edges array', function() {
        const mEdges = 8;
        const nNodes = 6;
        const maxNode = nNodes + 1;
        let edges = edgeGenerator.createEdges(nNodes, mEdges);

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
            let r = edgeGenerator.rand(i);
            let r2 = edgeGenerator.rand(i);
            expect(r).to.be.above(0);
            expect(r).to.be.below(i);
            expect(r2).to.be.above(0);
            expect(r2).to.be.below(i);
        }
    });

    it('generates the graphviz data from a nodes array', function() {
        const edges = [[1,2],[3,2],[4,2],[4,3],[5,1],[5,3]];
        let data = edgeGenerator.generateGraphvizData(edges);
        expect(data).to.equal('graph G {\n1 -- 2;\n3 -- 2;\n4 -- 2;\n4 -- 3;\n5 -- 1;\n5 -- 3;\n}');
    });

    it('checks if an edge-arrays contains an edge correctly', function() {
        const edges = [[1,2],[3,2],[4,2],[4,3],[5,1],[5,3]];

        expect(edgeGenerator.containsEdge([4,2], edges)).to.be.true;
        expect(edgeGenerator.containsEdge([2,4], edges)).to.be.true;
        expect(edgeGenerator.containsEdge([5,2], edges)).to.be.false;
    });

});