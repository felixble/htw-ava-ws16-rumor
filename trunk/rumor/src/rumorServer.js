import { ServerLogic } from './serverLogic'
import { Client } from './lib/client'

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
    }

    async _runAlgorithm(data, socket) {
        let newRumor = data.msg;
        let from = data.from || this.endpointManager.getMyId();

        let alreadyKnown = this.isKnown(newRumor);
        this.addRumor(newRumor, from);

        if (!alreadyKnown) {
            for (let i = 0; i < this.endpointManager.getMyNeighbors().length; i++) {
                let neighbor = this.endpointManager.getMyNeighbors()[i];

                if (!this.toldMe(newRumor, neighbor.id)) {
                    await this.tellRumorTo(newRumor, neighbor);
                }
            }
        }

        if (!this.getRumorByText(newRumor).believe && this.doIbelieve(newRumor)) {
            this.logI(`I believe the rumor: ${newRumor}`);
        }
    }

    /**
     * Checks wheather the node believes the
     * given rumor.
     *
     * @param rumorText
     * @returns {boolean|*}
     */
    doIbelieve(rumorText) {
        let rumor = this.getRumorByText(rumorText);
        rumor.believe = rumor.from.length >= this.believeCount;
        return rumor.believe;
    }

    /**
     *  Checks wheather the given rumor is already known.
     *
     * @param rumorText
     * @param id neighbor id
     * @returns {boolean}
     */
    toldMe(rumorText, id) {
        let index = this.getRumorIndexByText(rumorText);
        if (index === undefined) {
            return false;
        }
        let fromIndex = this.rumors[index].from.indexOf(id);
        return (fromIndex !== -1);
    }

    /**
     * Adds the given rumor to the list of known rumors.
     *
     * @param text
     * @param from
     */
    addRumor(text, from) {
        let rumorIndex = this.getRumorIndexByText(text);
        if (rumorIndex !== undefined) { // is known already
            let fromIndex = this.rumors[rumorIndex].from.indexOf(from);
            if (fromIndex === -1) {
                this.rumors[rumorIndex].from.push(from);
            }
        } else {
            let fromArr = (from === undefined) ? [] : [from];
            this.rumors.push({
                text: text,
                from: fromArr,
                believe: false
            });
        }
    }

    /**
     * Returns the rumor identified by the given message
     * from the list of known rumors.
     *
     * @param text
     * @returns {*}
     */
    getRumorByText(text) {
        let index = this.getRumorIndexByText(text);
        return this.rumors[index];
    }

    /**
     * Returns the rumor index identified by the given message
     * from the list of known rumors.
     *
     * @param text rumor message
     * @returns {*} the index of the rumor or undefined iff the rumor was not found.
     */
    getRumorIndexByText(text) {
        for (let i = 0; i < this.rumors.length; i++) {
            if (this.rumors[i].text === text) {
                return i;
            }
        }
        return undefined;
    }

    /**
     * Checks wheather the given rumor is already knwon.
     *
     * @param rumor
     * @returns {boolean}
     */
    isKnown(rumor) {
        let index = this.getRumorIndexByText(rumor);
        return (index !== undefined);
    }

    /**
     * Sends a given rumor to the designated neighbor.
     *
     * @param newRumor
     * @param neighbor
     */
    async tellRumorTo(newRumor, neighbor) {
        try {
            let msg = {msg: newRumor, from: this.endpointManager.getMyId(), type: 'rumor'};
            let client = new Client(neighbor.host, neighbor.port);
            await client.connect();
            await client.send(msg);
            client.close();
            this.logS(msg.msg, neighbor);
        } catch(e) {
            this.logE('Could not contact neighbor: ' + JSON.stringify(neighbor));
        }
    }
}