
import { Client } from './../lib/client';
let readLine = require('./../lib/read-line');


let optionParser = require('node-getopt').create([
    ['c', 'cmd=[ARG]', 'Command: "init" | "stop" | "stop all"'],
    ['', 'host=[ARG]', 'host'],
    ['', 'port=[ARG]', 'port'],
    ['r', 'rumor=[ARG]', 'the rumor which should be sent'],
    ['h', 'help', 'Display this help']
]);

let arg = optionParser.bindHelp().parseSystem();


async function sendMsgClient(host, port, msg) {
    let client = new Client(host, port);
    await client.connect();
    await client.send({msg: msg});
    client.close();
}

async function queryAddressSendMsg(msg) {
    let host = arg.options.host || await readLine('Enter host:');
    let port = arg.options.port || await readLine('Enter port:');
    try {
        await sendMsgClient(host, port, msg);
    } catch (e) {
        console.log(`Could not send msg to host: ${host}:${port}`);
    }
}

async function execCommand(cmd) {
    switch (cmd) {
        case 'init':
        {
            let rumor = arg.options.rumor || await readLine('Enter rumor:');
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
            throw new Error('Unknown command ' + cmd);
        }
    }
}

async function dialog() {
    let exit = false;
    while(!exit) {
        let cmd = await readLine('Enter command:');
        await execCommand(cmd);
    }
    process.exit();
}

async function main() {
    try {
        if (arg.options.cmd) {
            await execCommand(arg.options.cmd);
        } else {
            await dialog();
        }
    } catch (e) {
        console.error(e);
    }
}

main();
