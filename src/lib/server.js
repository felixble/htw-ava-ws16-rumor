let net = require('net');

/**
 * Simple tcp server which calls
 * a given callback-function on every
 * incoming tcp-message.
 */
export class Server {

    constructor(host, port) {
        this.host = host;
        this.port = port;
        this.server = null;
    }

    /**
     * Starts the tcp-server
     *
     * @param {function(socket, data)} callback which will be called on every incoming message.
     * @returns {Promise} which will be resolved after the server is closed.
     */
    listen(callback) {
        return new Promise(resolve => {
            this.server = net.createServer(function (socket) {
                socket.on('data', function (data) {
                    callback(socket, JSON.parse(data));
                });
            });
            this.server.listen(this.port, this.host);
            this.server.on('close', resolve);
        });
    }

    close() {
        this.server.close();
    }

}