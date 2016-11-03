import { ServerLogic } from './serverLogic'
import { Client } from './lib/client'


const BELIEVE_COUNT = 2;

export class RumorServer extends ServerLogic {


    constructor(server, endpointManager) {
        super(server, endpointManager);
        this.rumors = [];
    }

    async _runAlgorithm(data, socket) {
        let newRumor = data.msg;
        let from = data.from || this.endpointManager.getMyId();

        let alreadyKnown = this.isKnown(newRumor);
        this.addRumor(newRumor, from);

        if (!alreadyKnown) {
            this.addRumor(newRumor, from);
            for (let i = 0; i < this.endpointManager.getMyNeighbors().length; i++) {
                let neighbor = this.endpointManager.getMyNeighbors()[i];

                if (!this.toldMe(newRumor, neighbor.id)) {
                    await this.tellRumorTo(newRumor, neighbor);
                }
            }
        }

        if (!this.getRumorByText(newRumor).believe && this.doIbelieve(newRumor)) {
            this.constructor.log('INFO', `I believe the rumor: ${newRumor}`);
        }
    }

    doIbelieve(rumorText) {
        let rumor = this.getRumorByText(rumorText);
        rumor.believe = rumor.from.length >= BELIEVE_COUNT;
        return rumor.believe;
    }

    toldMe(rumorText, id) {
        let index = this.getRumorIndexByText(rumorText);
        if (index === undefined) {
            return false;
        }
        let fromIndex = this.rumors[index].from.indexOf(id);
        return (fromIndex !== -1);
    }

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

    getRumorByText(text) {
        let index = this.getRumorIndexByText(text);
        return this.rumors[index];
    }

    getRumorIndexByText(text) {
        for (let i = 0; i < this.rumors.length; i++) {
            if (this.rumors[i].text === text) {
                return i;
            }
        }
        return undefined;
    }

    isKnown(rumor) {
        let index = this.getRumorIndexByText(rumor);
        return (index !== undefined);
    }

    async tellRumorTo(newRumor, neighbor) {
        try {
            let msg = {msg: newRumor, from: this.endpointManager.getMyId()};
            let client = new Client(neighbor.host, neighbor.port);
            await client.connect();
            await client.send(msg);
            client.close();
            this.constructor.logS(msg.msg, neighbor);
        } catch(e) {
            console.log('Could not contact neighbor: ' + JSON.stringify(neighbor));
        }
    }
}