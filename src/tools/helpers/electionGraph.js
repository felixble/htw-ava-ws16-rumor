import { VoterGraph } from './voterGraph';
import { CandidateIdsManager } from '../../election/candidateIdsManager';
import { Random } from '../../lib/random';


export class ElectionGraph {

    constructor(numberOfNodes, numberOfSupportersPerCandidate, numberOfFriends) {
        this.numberOfNodes = numberOfNodes;
        this.numberOfCandidates = CandidateIdsManager.getCandidateIds().length;
        this.numberOfVoters = this.numberOfNodes - this.numberOfCandidates;
        this.numberOfSupporters = this.numberOfCandidates * numberOfSupportersPerCandidate;
        this.numberOfFriends = numberOfFriends;
    }

    generate() {
        this.graph = this.generateVotersGraph();
        this.addCandidates();
        let supporters = this.determineSupporters();
        this.addSupporterEdgesToGraph(supporters);
        return this.graph;
    }

    generateVotersGraph() {
        return (new VoterGraph(this.numberOfVoters, this.numberOfFriends)).generate()
    }

    addCandidates() {
        CandidateIdsManager.getCandidateIds().forEach(candidateId => {
            this.graph.addNode(candidateId);
        });
    }

    determineSupporters() {
        let firstSupporterId = this.getFirstSupporterId();
        let lastSupporterId = this.getLastSupporterId(firstSupporterId);
        let supporters = [];
        for (let i=firstSupporterId; i<=lastSupporterId; i++) {
            supporters.push(this.graph.nodes[i].id);
        }
        return supporters;
    }

    getFirstSupporterId() {
        let min = this.numberOfCandidates + 1;
        let max = (this.numberOfNodes - this.numberOfSupporters) + 1;
        return Random.randomNumber(min, max);
    }

    getLastSupporterId(firstSupporterId) {
        return (firstSupporterId + this.numberOfSupporters) - 1;
    }

    addSupporterEdgesToGraph(supporters) {
        supporters.forEach((supporterId, index) => {
            let candidateId = (index % this.numberOfCandidates) + 1;
            this.graph.addBidirectionalEdge(candidateId, supporterId);
        });
    }
}