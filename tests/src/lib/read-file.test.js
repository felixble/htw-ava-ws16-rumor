let expect = require('chai').expect;

let readFile = require('../../../src/lib/read-file');


let endpointParser = require('../../../src/parser/endpointParser');

describe('read-file', function() {

    it('reads a file correctly', function(done) {
        readFile('./tests/src/lib/fixtures/dummyFile')
            .then((data) => {
                expect(data).to.equal(" 1 isl-s-01:5000\n 2 isl-s-01:5001\n 3 127.0.0.1:2712");
                done();
            })
            .catch((error) => {
                done(error);
            });
    });

});