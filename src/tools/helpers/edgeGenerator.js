import { Random } from '../../lib/random';

export class EdgeGenerator {

    constructor(n, m) {
        this.constructor._assert(m > n, 'm > n');
        this.constructor._assert(n > 3, 'n > 3');
        this.constructor._assert(m <= (n*(n-1))/2, 'm <= (n*(n-1))/2');

        this.n = n;
        this.m = m;
        this.edges = [];
    }

    createEdges() {
        let start = 2;
        while (this.edges.length < this.m) {
            for (let i = start; i <= this.n; i++) {
                let accepted = false;
                let edge;
                while (!accepted) {
                    let j = this.constructor._rand(i);
                    edge = [i, j];
                    accepted = !this._containsEdge(edge);
                }
                this.edges.push(edge);
                if (this.edges.length >= this.m) {
                    break;
                }
            }
            start++;
        }
        return this.edges;
    }

    generateGraphvizData(nodeIdOffset = 0) {
        let result = 'graph G {\n';
        this.edges.forEach(node => {
            let a = node[0] + nodeIdOffset;
            let b = node[1] + nodeIdOffset;
            result += `${a} -- ${b};\n`;
        });
        result += '}';
        return result;
    }

    static _assert(bed, message) {
        if (!bed) {
            throw new Error(`Assertion (${message}) failed.`);
        }
    }

    static _rand(max) {
        return EdgeGenerator._randInt(1, max-1);
    }

    static _randInt(min, max) {
        Random.randomNumber(min, max);
        return Math.floor(Math.random()*(max-min+1)+min);
    }

    _containsEdge(edge) {
        let a = edge[0];
        let b = edge[1];
        let contains = false;
        this.edges.some(e => {
            if (e.indexOf(a) !== -1 && e.indexOf(b) !== -1 ) {
                contains = true;
                return true;
            }
            return false;
        });
        return contains;
    }

}