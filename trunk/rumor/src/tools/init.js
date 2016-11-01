
import { Client } from './../lib/client';
let readLine = require('./../lib/read-line');

async function sendMsgClient(host, port, msg) {
    let client = new Client(host, port);
    await client.connect();
    await client.send({msg: msg});
    client.close();
}

async function queryAddressSendMsg(msg) {
    let host = await readLine('Enter host:');
    let port = await readLine('Enter port:');
    try {
        await sendMsgClient(host, port, msg);
    } catch (e) {
        console.log(`Could not send msg to host: ${host}:${port}`);
    }
}

async function main() {
    let exit = false;
    while(!exit) {
        let cmd = await readLine('Enter command:');
        switch (cmd) {
            case 'init':
            {
                let rumor = await readLine('Enter rumor:');
                await queryAddressSendMsg(rumor);
                break;
            }
            case 'stop':
            {
                await queryAddressSendMsg('STOP');
                break;
            }
            case 'stop all':
            {
                await queryAddressSendMsg('STOP ALL');
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