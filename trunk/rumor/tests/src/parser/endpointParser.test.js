let expect = require('chai').expect;

let endpointParser = require('../../../src/parser/endpointParser');

describe('endpointParser', function() {

    it('parses a string correctly', function() {
        let res = endpointParser.parse(" 1 isl-s-01:5000\n 2 isl-s-01:5001\n 3 127.0.0.1:2712");

        expect(res).to.have.length(3);
        expect(res[0].id).to.equal('1');
        expect(res[1].id).to.equal('2');
        expect(res[2].id).to.equal('3');
        expect(res[0].host).to.equal('isl-s-01');
        expect(res[1].host).to.equal('isl-s-01');
        expect(res[2].host).to.equal('127.0.0.1');
        expect(res[0].port).to.equal('5000');
        expect(res[1].port).to.equal('5001');
        expect(res[2].port).to.equal('2712');
    });

    it('returns a single endpoint identified by its id', function() {
        const endpoints = [
            {id: 3, host: "host-3", port: "port-3"},
            {id: 1, host: "host-1", port: "port-1"},
            {id: 2, host: "host-2", port: "port-2"}
        ];

        let endpoint = endpointParser.getEndpointById(1, endpoints);
        expect(endpoint.id).to.equal(1);
        expect(endpoint.host).to.equal('host-1');
        expect(endpoint.port).to.equal('port-1');
    });

});