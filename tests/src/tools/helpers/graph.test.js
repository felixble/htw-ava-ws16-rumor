
let expect = require('chai').expect;

import { Graph } from '../../../../src/tools/helpers/graph';

describe('Graph', function() {

    describe('#fromEdges', function() {

        it('generates a graph from an edges array', function() {
            const EDGES = [[1,3],[1,5]];
            let graph = Graph.fromEdges(EDGES);
            expect(graph.nodes).to.have.ownProperty(1);
            expect(graph.nodes).to.have.ownProperty(3);
            expect(graph.nodes).to.have.ownProperty(5);

            expect(graph.nodes[1].edges).to.have.length(2);
            expect(graph.nodes[3].edges).to.have.length(1);
            expect(graph.nodes[5].edges).to.have.length(1);
        });
    });

    describe('#calcNodeDegreeRange', function() {

        it('calculates the degree range of each node', function() {
            let graph = new Graph();
            graph.nodes = {
                1: {edges: [3,5,8]},
                3: {edges: [1,5]},
                5: {edges: [1,3,6,7]},
                8: {edges: [1]},
                6: {edges: [5]},
                7: {edges: [5]}
            };
            let res = graph.calcNodeDegreeRange();
            expect(res.min).to.equal(1);
            expect(res.max).to.equal(4);
        })

    });

});