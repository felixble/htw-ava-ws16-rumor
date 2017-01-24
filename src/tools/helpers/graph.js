let connectedCommponents = require('connected-components');

export class Graph {

    static fromEdges(edges) {
        let graph = new Graph();
        edges.forEach(function(edge) {
            graph.addBidirectionalEdge(edge[0], edge[1]);
        });
        return graph;
    }

    constructor() {
        this.nodes = {};
        this.edges = [];
    }

    addBidirectionalEdge(nodeId1, nodeId2) {
        this.addEdge(nodeId1, nodeId2);
        this.addEdge(nodeId2, nodeId1);
        this.edges.push([nodeId1, nodeId2]);
    }

    addEdge(sourceNodeId, targetNodeId) {
        if (!this.hasNode(sourceNodeId)) {
            this.addNode(sourceNodeId);
        }
        this.nodes[sourceNodeId].edges.push(targetNodeId);
    }

    hasNode(nodeId) {
        return !!this.nodes[nodeId];
    }

    getNodeDegreeFor(nodeId) {
        return this.nodes[nodeId].edges.length;
    }

    addNode(nodeId) {
        this.nodes[nodeId] = {
            id: nodeId,
            edges: []
        };
    }

    getAdjacencyList(nodeIdOffset = 0) {
        let list = [];
        Object.keys(this.nodes).forEach(key => {
            let edges = this.nodes[key].edges.map(id => {
                return id - nodeIdOffset;
            });
            list.push(edges);
        });
        return list;
    }

    isStronglyConnected(nodeIdOffset = 0) {
        return connectedCommponents(this.getAdjacencyList(nodeIdOffset)).length === 1;
    }

    calcNodeDegreeRange() {
        let min = Number.MAX_VALUE,
            max = 0;
        Object.keys(this.nodes).forEach(id => {
            let length = this.getNodeDegreeFor(id);
            if (length > max) {
                max = length;
            }
            if (length < min) {
                min = length;
            }
        });
        return {
            min: min,
            max: max
        };
    }
}