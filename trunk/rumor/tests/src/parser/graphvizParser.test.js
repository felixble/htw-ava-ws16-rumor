let expect = require('chai').expect;

import { GraphvizParser } from '../../../src/parser/graphvizParser';

describe('graphvizParser', function() {

    const INPUT = "graph G {\n1 -- 2;\n3 -- 2;\n4 -- 2;\n4 -- 3;\n5 -- 1;\n5 -- 3;\n}";
    let parser;

    beforeEach(function() {
        parser = new GraphvizParser();
    });

    it('parses a string correctly', function() {
        parser.parse(INPUT);

        expect(parser.nodes).to.have.length(5);
        expect(parser.nodes[0].neighbors).to.have.members(['2', '5']);      // 1: 1 -- 2 ; 5 -- 1
        expect(parser.nodes[1].neighbors).to.have.members(['1', '3', '4']); // 2: 1 -- 2 ; 3 -- 2 ; 4 -- 2
        expect(parser.nodes[2].neighbors).to.have.members(['4', '5', '2']); // 3: 3 -- 2 ; 4 -- 3 ; 5 -- 3
        expect(parser.nodes[3].neighbors).to.have.members(['3', '2']);      // 4: 4 -- 3 ; 4 -- 2
        expect(parser.nodes[4].neighbors).to.have.members(['1', '3']);      // 5: 5 -- 1 ; 5 -- 3
    });

    it('adds nodes correctly', function() {
        const nodeId = 5;
        parser.addNode(nodeId);
        expect(parser.nodes).to.have.length(1);
        expect(parser.nodes[0].id).to.equal(nodeId);
        expect(parser.nodes[0]).to.have.ownProperty('neighbors');
        expect(parser.nodes[0].neighbors).to.have.length(0);
    });

    it('adds an edge to a non-existing node', function() {
        const nodeA = 5;
        const nodeB = 7;

        parser.addEdge(nodeA, nodeB);
        expect(parser.nodes).to.have.length(2);
        expect(parser.nodes[0].id).to.equal(nodeA);
        expect(parser.nodes[1].id).to.equal(nodeB);
        expect(parser.nodes[0].neighbors).to.have.length(1);
        expect(parser.nodes[1].neighbors).to.have.length(1);
        expect(parser.nodes[0].neighbors).to.include(nodeB);
        expect(parser.nodes[1].neighbors).to.include(nodeA);
    });

    it('adds an edge to an existing node', function() {
        // 5 -- 7 ; 13 -- 7
        const nodeA = 5;
        const nodeB = 7;
        const nodeC = 13;

        parser.addEdge(nodeA, nodeB);
        parser.addEdge(nodeC, nodeB);

        expect(parser.nodes).to.have.length(3);
        expect(parser.nodes[0].id).to.equal(nodeA);
        expect(parser.nodes[1].id).to.equal(nodeB);
        expect(parser.nodes[2].id).to.equal(nodeC);
        expect(parser.nodes[0].neighbors).to.have.length(1);
        expect(parser.nodes[1].neighbors).to.have.length(2);
        expect(parser.nodes[2].neighbors).to.have.length(1);
        expect(parser.nodes[0].neighbors).to.include(nodeB);
        expect(parser.nodes[1].neighbors).to.include(nodeA);
        expect(parser.nodes[1].neighbors).to.include(nodeC);
        expect(parser.nodes[2].neighbors).to.include(nodeB);
    });

});