import { GraphvizParser } from './parser/graphvizParser';

let readFile = require('./lib/read-file');
let endpointParser = require('./parser/endpointParser');

const MIN_PORT = 4000;

export class EndpointManager {

    /**
     * Constructor for a new EndpointManager instance.
     *
     * @param endpointFilename  string|null filename of the file where the endpoints are defined,
     *                                      or null - then the endpoint ids will be mapped to local ports.
     * @param graphFilename     string      filename of the graphviz file which defines the network topology.
     */
    constructor(endpointFilename, graphFilename) {
        this.endpointFilename = endpointFilename;
        this.graphFilename = graphFilename;
    }

    async init() {
        let rawGraphFile = await readFile(this.graphFilename);
        this.graphvizParser = new GraphvizParser();
        this.graphvizParser.parse(rawGraphFile);

        if (null !== this.endpointFilename) {
            let rawEndpointsFile = await readFile(this.endpointFilename);
            this.endpoints = endpointParser.parse(rawEndpointsFile);
        } else {
            let min = this.graphvizParser.getNodeWithSmallestId().id;
            let max = this.graphvizParser.getNodeWithBiggestId().id;
            this.generateLocalEndpoints(min, max);
        }

    }

    setMyId(id) {
        this.myId = id;
        this.myEndpoint = endpointParser.getEndpointById(this.myId, this.endpoints);
        let myNode = this.graphvizParser.getNode(this.myId);
        if (myNode === undefined) {
            throw new Error(`Illegal state - the Id ${id} is not a node in the given graph`);
        }
        this.myNeighbors = endpointParser.getEndpoints(myNode.neighbors, this.endpoints);
    }

    getMyId() {
        return this.myId;
    }

    getMyEndpoint() {
        return this.myEndpoint;
    }

    getMyNeighbors() {
        return this.myNeighbors;
    }

    generateLocalEndpoints(min, max) {
        this.endpoints = [];
        let index = 0;
        let port = MIN_PORT;
        for (let id = min; id <= max; id++) {
            this.endpoints[index] = {
                id: id,
                host: 'localhost',
                port: port
            };
            index++;
            port++;
        }
    }

}