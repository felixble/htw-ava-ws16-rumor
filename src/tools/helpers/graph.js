

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
    }

    addBidirectionalEdge(nodeId1, nodeId2) {
        this.addEdge(nodeId1, nodeId2);
        this.addEdge(nodeId2, nodeId1);
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

    getNeighborsForNode(nodeId) {
        return this.nodes[nodeId].edges;
    }

    addNode(nodeId) {
        this.nodes[nodeId] = {
            edges: []
        };
    }

    calcNodeDegreeRange() {
        let min = Number.MAX_VALUE,
            max = 0;
        Object.keys(this.nodes).forEach(id => {
            let length = this.nodes[id].length;
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