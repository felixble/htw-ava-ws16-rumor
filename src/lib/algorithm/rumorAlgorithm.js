import { Random } from '../random';

/**
 * This algorithm receives an incoming
 * message and distributes the message
 * to all its neighbors iff the message
 * is not already known.
 */
export class RumorAlgorithm {

    /**
     * @callback SendRumorCallback
     * @param {object} neighbor
     * @param {object} content
     */

    /**
     * Will be called when the algorithm
     * processes a new unknown incoming rumor.
     *
     * @callback NewIncomingRumorCallback
     * @param {object} rumor
     * @param {string} rumorId
     * @return {boolean} true, iff the rumor shall be distributed
     */

    /**
     * Will be called after an incoming messsage
     * was processed.
     *
     * @callback OnMsgProcessedCallback
     * @param {string} rumor content
     */

    /**
     *
     * @param myId
     * @param neighbors
     * @param sendMsgCallback {SendRumorCallback}
     */
    constructor(myId, neighbors, sendMsgCallback) {
        this.myId = myId;
        this.neighbors = neighbors;
        /** @type {SendRumorCallback} */
        this.sendMsgCallback = sendMsgCallback;
        /** @type {OnMsgProcessedCallback} */
        this.onMessageProcessed = null;
        /** @type {NewIncomingRumorCallback} */
        this.onNewIncomingRumor = null;
        this.rumors = [];
        this.currentRumorId = null;
    }

    /**
     *
     * @param {OnMsgProcessedCallback} onMessageProcessed
     */
    setOnMessageProcessed(onMessageProcessed) {
        this.onMessageProcessed = onMessageProcessed;
    }

    /**
     *
     * @param {NewIncomingRumorCallback} onNewIncomingRumor
     */
    setOnNewIncomingRumorListener(onNewIncomingRumor) {
        this.onNewIncomingRumor = onNewIncomingRumor;
    }

    resetCurrentRumorId() {
        this.currentRumorId = null;
    }

    async initiateRumorDistribution(msg) {
        this.currentRumorId = Random.generateId();
        await this.distributeRumor(msg, false, this.currentRumorId);
    }

    async distributeRumor(msg, sendMsgToNeighborWithId = false, id = false) {
        id = (!id) ? Random.generateId() : id;
        for (let i = 0; i < this.neighbors.length; i++) {
            let neighbor = this.neighbors[i];

            if (!sendMsgToNeighborWithId || sendMsgToNeighborWithId(neighbor.id)) {
                await this.tellRumorTo(msg, id, neighbor);
            }
        }
    }

    /**
     * Processes an incoming echo message.
     *
     * @param msg          the incoming message
     * @param neighborId    the id of the neighbor
     *                      who sent the message
     */
    async processIncomingMessage(msg, neighborId) {
        let rumorId = (msg.hasOwnProperty('id')) ? msg.id : msg;
        let content = (msg.hasOwnProperty('content')) ? msg.content : msg;


        let alreadyKnown = this.isKnown(rumorId);
        this.currentRumorId = rumorId;
        this.addRumor(rumorId, neighborId);

        if (!alreadyKnown) {
            let distribute = true;
            if (this.onNewIncomingRumor) {
                distribute = this.onNewIncomingRumor(content, rumorId);
            }
            if (distribute) {
                await this.distributeRumor(
                    content,
                    (id) => {
                        return !this.toldMe(rumorId, id);
                    },
                    rumorId
                );
            }
        }

        if (this.onMessageProcessed) {
            this.onMessageProcessed(rumorId);
        }
    }


    /**
     *  Checks whether the given rumor is already known.
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
     * @param id
     * @param neighbor
     */
    async tellRumorTo(newRumor, id, neighbor) {
        await this.sendMsgCallback(neighbor, { content: newRumor, id: id });
    }

}