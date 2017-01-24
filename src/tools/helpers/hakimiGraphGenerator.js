import { Graph } from './graph';

function isOdd(num) {
    return ((num % 2) === 1);
}

/**
 * Generates a graph by a given array of node degree for each node.
 * Uses the havel hakimi algorithm.
 *
 * See: http://www.dcs.gla.ac.uk/~pat/af2009/mySlides/Havel-Hakimi.ppt
 * See: https://github.com/jacquerie/hh
 */
export class HakimiGraphGenerator {

    static withEqualDegrees(nodeCount, degree, nodeIdOffset = 0) {
        let degrees = [];
        for (let i=0; i<nodeCount; i++) {
            degrees.push(degree);
        }
        return new HakimiGraphGenerator(degrees, nodeIdOffset);
    }

    constructor(degrees, nodeIdOffset = 0) {
        this.elements = degrees.map((degree, index) => {
            return {
                degree: degree,
                nodeId: index + nodeIdOffset
            }
        });
        this.graph = new Graph();
    }

    generate() {
        this.checkPreconditions();
        while(this.isAnyDegreeAboveZero()) {
            this.sortDegreesDescending();
            this.connectFirstNodeWithFollowingNodes();
        }
        this.checkPostconditions();
    }

    checkPreconditions() {
        let minDegreeValue = this.elements - 1;
        if (this.isAnyDegreeAbove(minDegreeValue) || this.isOddNumberOfOddDegrees()) {
            this._throwInvalidArgument();
        }
    }

    isAnyDegreeAbove(value) {
        return this.elements.some((element) => {
            return element.degree > value;
        });
    }

    isOddNumberOfOddDegrees() {
        let numberOfOddDegress = this.elements.filter(element => {
            return isOdd(element.degree);
        }).length;
        return isOdd(numberOfOddDegress);
    }

    isAnyDegreeAboveZero() {
        return this.isAnyDegreeAbove(0);
    }

    sortDegreesDescending() {
        this.elements.sort((a, b) => {
            return b.degree - a.degree;
        })
    }

    connectFirstNodeWithFollowingNodes() {
        const connectionCount = this.elements[0].degree;
        for (let i=1; i<=connectionCount; i++) {
            this.graph.addBidirectionalEdge(this.elements[0].nodeId, this.elements[i].nodeId);
            this.elements[i].degree--;
            this.elements[0].degree--;
        }
    }

    checkPostconditions() {
        if (this.isAnyDegreeBelowZero()) {
            this._throwInvalidArgument();
        }
    }

    isAnyDegreeBelowZero() {
        return this.elements.some((element) => {
            return element.degree < 0;
        });
    }

    _throwInvalidArgument() {
        throw new Error('invalid-argument: Cannot generate graph with degress: ' + this.elements.map(e => {return e.degree}));
    }
}