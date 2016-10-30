let net = require('net');

export class Server {

    constructor(host, port) {
        this.host = host;
        this.port = port;
    }

    listen(callback) {
        net.createServer(function (socket) {
            socket.on('data', function (data) {
                callback(socket, JSON.parse(data));
            });
        }).listen(this.port, this.host);
    }

}