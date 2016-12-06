let net = require('net');

/**
 * Implementation of a simple tcp client.
 */
export class Client {
    constructor(host, port) {
        this.host = host;
        this.port = port;
        this.client = new net.Socket();
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.client.connect(this.port, this.host, function () {
                resolve();
            });
            this.client.on('error', function(error) {
                reject(error);
            });
        });
    }

    send(msgObj) {
        return new Promise((resolve, reject) => {
            this.client.on('data', function(data) {
                resolve(JSON.parse(data));
            });
            this.client.on('error', function(error) {
                reject(error);
            });
            this.client.write(JSON.stringify(msgObj));
        });
    }

    close() {
        this.client.end();
    }

}