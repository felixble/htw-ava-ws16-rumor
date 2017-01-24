import { _ } from 'underscore';
import { Random } from '../../lib/random';
import { Graph } from './graph';

export class GraphGenerator {

    constructor(nodeCount, nodeDegree) {
        this.nodeCount = nodeCount;
        this.nodeDegree = nodeDegree;
        this.graph = new Graph();
        this.freeNodeIds = GraphGenerator._generateNodeIds(this.nodeCount);
    }

    static _generateNodeIds(count) {
        let nodeIds = [];
        for (let i = 0; i<count; i++) {
            nodeIds.push(i);
        }
        return nodeIds;
    }

    generate() {
        for(let i = 0; i<this.nodeCount; i++) {
            this.addNodeIfNotExists(i);
            this.addRemainingEdges(i);
        }
    }

    addNodeIfNotExists(nodeId) {
        if (!this.graph.hasNode(nodeId)) {
            this.graph.addNode(nodeId);
        }
    }

    addRemainingEdges(nodeId) {
        const remainingNeighborsCount = this.nodeDegree - this.graph.getNeighborsForNode(nodeId).length;
        console.log(`Node ${nodeId} needs ${remainingNeighborsCount} further neighbors`);
        for (let i=0; i<remainingNeighborsCount; i++) {
            this.addRandomEdge(nodeId);
        }
        this.crossNodeIdFromFreeNodesArray(nodeId);
    }

    addRandomEdge(nodeId) {
        let neighbors = this.graph.getNeighborsForNode(nodeId);
        let possibleFreeNeighbors = this._getPossibleFreeNeighbors(nodeId, neighbors);
        console.log(possibleFreeNeighbors);
        let newNeighborId = Random.getRandomElementFromArray(possibleFreeNeighbors);
        this.graph.addBidirectionalEdge(nodeId, newNeighborId);
        if (this.graph.nodes[newNeighborId].edges.length === this.nodeDegree) {
            this.crossNodeIdFromFreeNodesArray(newNeighborId);
        }
    }

    _getPossibleFreeNeighbors(myId, myNeighbors) {
        return _.difference(this.freeNodeIds, myNeighbors, [myId]);
    }

    crossNodeIdFromFreeNodesArray(nodeId) {
        this.freeNodeIds = _.difference(this.freeNodeIds, [nodeId]);
    }
}