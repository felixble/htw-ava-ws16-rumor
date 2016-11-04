import { GraphvizParser } from './parser/graphvizParser';

let readFile = require('./lib/read-file');
let endpointParser = require('./parser/endpointParser');

export class EndpointManager {

    constructor(endpointFilename, graphFilename) {
        this.endpointFilename = endpointFilename;
        this.graphFilename = graphFilename;
    }

    async init() {
        let rawEndpointsFile = await readFile(this.endpointFilename);
        this.endpoints = endpointParser.parse(rawEndpointsFile);

        let rawGraphFile = await readFile(this.graphFilename);
        this.graphvizParser = new GraphvizParser();
        this.graphvizParser.parse(rawGraphFile);
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

}