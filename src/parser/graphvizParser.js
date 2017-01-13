
const pattern = /([0-9]+)\s*--\s*([0-9]+)/g;

/**
 * Parser to read a graphviz file.
 */
export class GraphvizParser {

    constructor() {
        this.nodes = [];
    }

    /**
     * Parses the given string.
     *
     * @param string
     */
    parse(string) {
        let match = pattern.exec(string);
        while (match != null) {
            let nodeA = parseInt(match[1]);
            let nodeB = parseInt(match[2]);
            this.addEdge(nodeA, nodeB);
            match = pattern.exec(string);
        }
    }

    /**
     * Adds a new edge to the nodes array.
     * If one of the nodes is not already a part of
     * the nodes array it will be added.
     * Then the nodes will be set as neighbor node
     * of each other.
     *
     * @param nodeA
     * @param nodeB
     */
    addEdge(nodeA, nodeB) {
        let nodeAIndex = this.getNodeIndex(nodeA);
        let nodeBIndex = this.getNodeIndex(nodeB);
        if (undefined == nodeAIndex) { nodeAIndex = this.addNode(nodeA) }
        if (undefined == nodeBIndex) { nodeBIndex = this.addNode(nodeB) }

        this.nodes[nodeAIndex].neighbors.push(nodeB);
        this.nodes[nodeBIndex].neighbors.push(nodeA);
    };

    /**
     * Adds a new node to the nodes array.
     *
     * @param node
     * @returns {number}
     */
    addNode(node) {
        let length = this.nodes.push({
            id: node,
            neighbors: []
        });
        return (length - 1);
    }

    /**
     * Returns the node identified by the given node id.
     *
     * @param nodeId
     * @returns {*}
     */
    getNode(nodeId) {
        return this.nodes[this.getNodeIndex(nodeId)];
    }

    /**
     * Returns the index of the node
     * identified by the given node id.
     *
     * @param node
     * @returns {*}
     */
    getNodeIndex(node) {
        for (let i = 0; i < this.nodes.length; i++) {
            if (node === this.nodes[i].id) {
                return i;
            }
        }
        return undefined;
    }

    /**
     * Returns the node with the smallest id.
     *
     * @returns {*}
     */
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

    /**
     * Returns the node with the
     * @returns {*}
     */
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