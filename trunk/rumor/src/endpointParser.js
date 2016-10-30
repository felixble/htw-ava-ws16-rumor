
const pattern = /([0-9]+)\s(.*):([0-9]*)/g;

let parse = function(string) {
    let lines = string.split('\n');
    return lines.map(line => {
        let id, host, port;

        let match = pattern.exec(line);
        while (match != null) {
            id = match[1];
            host = match[2];
            port = match[3];
            match = pattern.exec(line);
        }

        return {
            id: id,
            host: host,
            port: port
        };
    });
};

let getEndpointById = function(id, endpoints) {
    let endpoint = null;
    endpoints.some(e => {
        if (e.id === id) {
            endpoint = e;
        }
        return e.id === id;
    });
    return endpoint;
};

let getNeightbors = function(id, endpoints) {
    return endpoints.filter(endpoint => {
        return endpoint.id !== id;
    })
};

module.exports = {
    parse: parse,
    getEndpointById: getEndpointById,
    getNeightbors: getNeightbors
};