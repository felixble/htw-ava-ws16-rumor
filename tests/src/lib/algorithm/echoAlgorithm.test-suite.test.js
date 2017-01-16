let expect = require('chai').expect;
import { _ } from 'underscore'

import { EchoAlgorithm } from '../../../../src/lib/algorithm/echoAlgorithm';

class EchoNode {

    constructor(id, neighbors, nodesGraph) {
        this.id = id;
        this.neighbors = neighbors;
        this.nodesGraph = nodesGraph;
        this.msg = null;
        this.echoAlgo = new EchoAlgorithm(neighbors, _.bind(this._sendMsg, this));
        this.echoAlgo.setNewMessageListener(_.bind(this._newMsg, this));
    }

    async initEchoAlgo(content, onEchoDistributed) {
        this.msg = content;
        await this.echoAlgo.initEcho(content, onEchoDistributed);
    }

    async _sendMsg(neighbor, msg) {
        this.nodesGraph.msgBuffer.push(`${this.id} SENDS ${JSON.stringify(msg)} to ${neighbor.id}`);
        let receiver = this.nodesGraph.getNodeForId(neighbor.id);
        await receiver._receiveMsg(msg, this.id);
    }

    async _receiveMsg(msg, id) {
        this.echoAlgo.processIncomingMsg(msg, id);
    }

    _newMsg(content) {
        this.msg = content;
    }

}


class NodesGraph {
    constructor(config) {
        this.nodes = [];
        this.msgBuffer = [];
        this.init(config);
    }

    init(config) {
        config.nodes.forEach(node => {
            this.nodes.push(new EchoNode(node.id, NodesGraph.makeNeighbors(node.neighbors), this))
        })
    }

    /**
     *
     * @param id
     * @returns {EchoNode}
     */
    getNodeForId(id) {
        let i = 0;
        this.nodes.some(node => {
            if (node.id === id) { return true; }
            i++;
            return false;
        });
        return this.nodes[i];
    }

    static makeNeighbors(ids) {
        return ids.map(id => {
            return {id: id}
        });
    }
}

describe('EchoAlgorithm Test-Suite', function() {

    let nodesGraph;

    const config = {
        nodes: [
            {id: '1', neighbors: ['5', '2']},
            {id: '2', neighbors: ['1', '3', '4']},
            {id: '3', neighbors: ['2', '4', '5']},
            {id: '4', neighbors: ['2', '3']},
            {id: '5', neighbors: ['1', '3']}
        ]
    };

    beforeEach(function() {
        nodesGraph = new NodesGraph(config);
    });

    it('terminates', function(done) {
        let initNode = nodesGraph.getNodeForId('1');
        initNode.initEchoAlgo('A special message', function() {
            done();
        });
    });

    it('makes all nodes green', function(done) {
        let initNode = nodesGraph.getNodeForId('1');
        initNode.initEchoAlgo('A special message', function() {

            for(let i=0; i<nodesGraph.nodes.length; i++) {
                let node = nodesGraph.nodes[i];
                expect(node.echoAlgo.states.states[0].isGreen()).to.be.true;
            }

            done();

        });
    });

    it('sends the echo message to all nodes', function(done) {
        const msg = 'A special message';
        let initNode = nodesGraph.getNodeForId('1');
        initNode.initEchoAlgo(msg, function () {
            for(let i=0; i<nodesGraph.nodes.length; i++) {
                let node = nodesGraph.nodes[i];
                expect(node.msg, `node ${i} didn't receive the msg`).to.equal(msg);
            }

            done();
        });
    });

    it('sends the correct amount of messages', function(done) {
        const msg = 'A special message';
        let initNode = nodesGraph.getNodeForId('1');
        initNode.initEchoAlgo(msg, function () {
            expect(nodesGraph.msgBuffer).to.have.length(12);

            console.log(nodesGraph.msgBuffer);

            done();
        });
    });

});