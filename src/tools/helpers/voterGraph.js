import { HakimiGraphGenerator } from './hakimiGraphGenerator';

const NODE_ID_OFFSET = 3;

export class VoterGraph {

    constructor(numberOfVoters, numberOfFriends) {
        this.numberOfVoters = numberOfVoters;
        this.numberOfFriends = numberOfFriends;
    }

    generate() {
        let generator = HakimiGraphGenerator.withEqualDegrees(this.numberOfVoters, this.numberOfFriends, NODE_ID_OFFSET);
        let graph = generator.generate();
        if (!graph.isStronglyConnected(NODE_ID_OFFSET)) {
            throw new Error('Graph is not strongly connected. Try different input.');
        }
        return graph;
    }

}