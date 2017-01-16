/**
 * This algorithm receives an incoming
 * message and distributes the message
 * to all its neighbors iff the message
 * is not already known.
 */
export class RumorAlgorithm {

    /**
     * @callback SendMsgCallback
     * @param {object} neighbor
     * @param {object} content
     * @param {string} type
     */

    /**
     * @callback OnMsgProcessedCallback
     * @param {string} rumor content
     */

    /**
     *
     * @param myId
     * @param neighbors
     * @param sendMsgCallback
     */
    constructor(myId, neighbors, sendMsgCallback) {
        this.myId = myId;
        this.neighbors = neighbors;
        /** @type {SendMsgCallback} */
        this.sendMsgCallback = sendMsgCallback;
        /** @type {OnMsgProcessedCallback} */
        this.onMessageProcessed = null;

        this.rumors = [];
    }

    /**
     *
     * @param {OnMsgProcessedCallback} onMessageProcessed
     */
    setOnMessageProcessed(onMessageProcessed) {
        this.onMessageProcessed = onMessageProcessed;
    }

    /**
     * Processes an incoming echo message.
     *
     * @param msg           the incoming message
     * @param neighborId    the id of the neighbor
     *                      who sent the message
     */
    async processIncomingMessage(msg, neighborId) {

        let alreadyKnown = this.isKnown(msg);
        this.addRumor(msg, neighborId);

        if (!alreadyKnown) {
            for (let i = 0; i < this.neighbors.length; i++) {
                let neighbor = this.neighbors[i];

                if (!this.toldMe(msg, neighbor.id)) {
                    await this.tellRumorTo(msg, neighbor);
                }
            }
        }

        if (this.onMessageProcessed) {
            this.onMessageProcessed(msg);
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
     * @param neighbor
     */
    async tellRumorTo(newRumor, neighbor) {
        await this.sendMsgCallback(neighbor, newRumor, 'rumor');
    }

}