
const pattern = /([0-9]+)\s*--\s*([0-9]+);/g;

export class GraphvizParser {

    constructor() {
        this.nodes = [];
    }

    parse(string) {
        let match = pattern.exec(string);
        while (match != null) {
            let nodeA = parseInt(match[1]);
            let nodeB = parseInt(match[2]);
            this.addEdge(nodeA, nodeB);
            match = pattern.exec(string);
        }
    }

    addEdge(nodeA, nodeB) {
        let nodeAIndex = this.getNodeIndex(nodeA);
        let nodeBIndex = this.getNodeIndex(nodeB);
        if (undefined == nodeAIndex) { nodeAIndex = this.addNode(nodeA) }
        if (undefined == nodeBIndex) { nodeBIndex = this.addNode(nodeB) }

        this.nodes[nodeAIndex].neighbors.push(nodeB);
        this.nodes[nodeBIndex].neighbors.push(nodeA);
    };

    addNode(node) {
        let length = this.nodes.push({
            id: node,
            neighbors: []
        });
        return (length - 1);
    }

    getNode(nodeId) {
        return this.nodes[this.getNodeIndex(nodeId)];
    }

    getNodeIndex(node) {
        for (let i = 0; i < this.nodes.length; i++) {
            if (node === this.nodes[i].id) {
                return i;
            }
        }
        return undefined;
    }

    getNodeWithSmallestId() {
        let min = Number.MAX_VALUE;
        let index = -1;
        for (let i = 0; i < this.nodes.length; i++) {
            let id = this.nodes[i].id;
            if (id <= min) {
                index = i;
                min = id;
            }
        }

        if (index !== -1) {
            return this.nodes[index];
        }

        return undefined;
    }

    getNodeWithBiggestId() {
        let max = 0;
        let index = -1;
        for (let i = 0; i < this.nodes.length; i++) {
            let id = this.nodes[i].id;
            if (id >= max) {
                index = i;
                max = id;
            }
        }

        if (index !== -1) {
            return this.nodes[index];
        }

        return undefined;
    }
}