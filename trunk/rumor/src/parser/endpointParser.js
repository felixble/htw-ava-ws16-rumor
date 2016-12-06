/**
 * Pattern to identify the components of
 * a single endpoint containing an id, the host
 * and the port of the endpoint.
 * @type {RegExp}
 */
const pattern = /([0-9]+)\s(.*):([0-9]*)/g;

/**
 * Parses a given string of multiple
 * endpoints separated by newlines.
 *
 * @param string
 * @returns {Array|*|{}}
 */
let parse = function(string) {
    let lines = string.split('\n');
    return lines.map(line => {
        let id, host, port;

        let match = pattern.exec(line);
        while (match != null) {
            id = parseInt(match[1]);
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

/**
 * Returns a concrete endpoint from the given
 * array of endpoints identified by its id.
 *
 * @param id
 * @param endpoints
 * @returns {*}
 */
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

/**
 * Returns all endpoints except the
 * one identified by the given id.
 *
 * This function was used in the
 * first version (hello server)
 *
 * @param id
 * @param endpoints
 * @returns {Array.<T>|Array|*}
 */
let getNeightbors = function(id, endpoints) {
    return endpoints.filter(endpoint => {
        return endpoint.id !== id;
    })
};

/**
 * Returns the endpoints identified by the
 * given ids.
 *
 * @param ids
 * @param endpoints
 * @returns {Array|*|{}}
 */
let getEndpoints = function(ids, endpoints) {
    return ids.map(id => {
        return getEndpointById(id, endpoints);
    })
};

module.exports = {
    parse: parse,
    getEndpointById: getEndpointById,
    getNeighbors: getNeightbors,
    getEndpoints: getEndpoints
};