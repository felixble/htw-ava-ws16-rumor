
import { Client } from './lib/client';
let readLine = require('./lib/read-line');

async function initClient(host, port) {
    let client = new Client(host, port);
    await client.connect();
    await client.send({msg: 'INIT'});
    client.close();
}

async function stopClient(host, port) {
    let client = new Client(host, port);
    await client.connect();
    await client.send({msg: 'STOP'});
    client.close();
}

async function main() {
    let exit = false;
    while(!exit) {
        let cmd = await readLine('Enter command:');
        switch (cmd) {
            case 'init':
            {
                let host = await readLine('Enter host:');
                let port = await readLine('Enter port:');
                await initClient(host, port);
                break;
            }
            case 'stop':
            {
                let host = await readLine('Enter host:');
                let port = await readLine('Enter port:');
                await stopClient(host, port);
                break;
            }
            case 'exit':
            {
                exit = true;
                break;
            }
            default: {
                console.log('Unknown command: ' + cmd);
            }
        }
    }
    process.exit();
}

main();