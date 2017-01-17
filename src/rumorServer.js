import { _ } from 'underscore';
import { ServerLogic } from './serverLogic'
import { Client } from './lib/client'
import { RumorAlgorithm } from './lib/algorithm/rumorAlgorithm';

/**
 * Default believe count, iff no
 * parameter is given.
 *
 * @type {number}
 */
const BELIEVE_COUNT = 2;

/**
 * Logic for a network node which can receive and send
 * rumors.
 */
export class RumorServer extends ServerLogic {


    constructor(server, endpointManager, believeCount = -1) {
        super(server, endpointManager);
        this.rumors = [];
        this.believeCount = (believeCount === -1) ? BELIEVE_COUNT : believeCount;
        this.algorithm = new RumorAlgorithm(
            this.endpointManager.getMyId(), this.endpointManager.getMyNeighbors(), _.bind(this.sendRumorTo, this));
        this.algorithm.setOnMessageProcessed(_.bind(this.onMessageProcessed, this));
    }

    async _runAlgorithm(data, socket) {
        let from = data.from || this.endpointManager.getMyId();
        await this.algorithm.processIncomingMessage(data.msg, from);
    }

    onMessageProcessed(msg) {
        let rumor = this.algorithm.getRumorByText(msg);
        if (!rumor.believe && this.doIbelieve(rumor)) {
            this.logI(`I believe the rumor: ${msg}`);
        }
    }

    /**
     * Checks whether the node believes the
     * given rumor.
     *
     * @param rumor
     * @returns {boolean|*}
     */
    doIbelieve(rumor) {
        rumor.believe = rumor.from.length >= this.believeCount;
        return rumor.believe;
    }


    /**
     * Sends a given rumor to the designated neighbor.
     *
     * @param neighbor
     * @param newRumor
     */
    async sendRumorTo(neighbor, newRumor) {
        await this.sendMsgTo(neighbor, newRumor, 'rumor');
    }
}