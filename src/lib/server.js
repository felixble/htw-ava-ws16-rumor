let net = require('net');

export class Server {

    constructor(host, port) {
        this.host = host;
        this.port = port;
        this.server = null;
    }

    listen(callback) {
        this.server = net.createServer(function (socket) {
            socket.on('data', function (data) {
                callback(socket, JSON.parse(data));
            });
        });
        this.server.listen(this.port, this.host);
    }

    close() {
        if (null !== this.server) {
            this.server.close(()=> {console.log('server closed')});
        } else {
            console.log('no server instance!');
        }
    }

}