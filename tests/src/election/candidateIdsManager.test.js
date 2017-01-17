let expect = require('chai').expect;

import { CandidateIdsManager } from '../../../src/election/candidateIdsManager';


describe('CandidateIdsManager', function() {

    describe('#amIACandidate', function() {


        it('returns true for IDS 1 and 2; otherwise false', function() {
            expect(CandidateIdsManager.amIACandidate(1)).to.be.true;
            expect(CandidateIdsManager.amIACandidate(2)).to.be.true;
            expect(CandidateIdsManager.amIACandidate(3)).to.be.false;
        });

    });



});