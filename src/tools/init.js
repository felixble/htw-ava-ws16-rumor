
import { Client } from './../lib/client';
let readLine = require('./../lib/read-line');


let optionParser = require('node-getopt').create([
    ['c', 'cmd=[ARG]', 'Command: "init" | "stop" | "stop all"'],
    ['', 'host=[ARG]', 'host'],
    ['', 'port=[ARG]', 'port'],
    ['', 'addresses=[ARG]', 'destination addresses format: <host:port>'],
    ['m', 'msg=[ARG]', 'the message content which should be sent'],
    ['t', 'type=[ARG]', 'the message type of the message which should be sent'],
    ['h', 'help', 'Display this help']
]);

let arg = optionParser.bindHelp().parseSystem();


async function sendMsgClient(host, port, msg, type='control') {
    try {
        let client = new Client(host, port);
        await client.connect();
        let response = await client.send({msg: msg, type: type});
        console.log(JSON.stringify(response));
        client.close();
    } catch (e) {
        console.log(`Could not send msg to host: ${host}:${port}`);
    }
}

async function queryAddressSendMsg(msg, type='control') {
    if (arg.options.host && arg.options.host) {
        await sendMsgClient(arg.options.host, arg.options.port, msg, type);
    } else {
        let addresses = (arg.options.addresses || await readLine('Enter addresses <host:port;...;host:port>:')).split(';');
        for(let i=0; i<addresses.length; i++) {
            let address = addresses[i];
            let hostPort = address.split(':');
            await sendMsgClient(hostPort[0], hostPort[1], msg, type);
        }
    }
}

/**
 * Executes a command.
 *
 * @param cmd
 * @returns {boolean} true, if the dialog should be terminated.
 */
async function execCommand(cmd) {
    switch (cmd) {
        case 'init':
        {
            let rumor = arg.options.msg || await readLine('Enter rumor:');
            await queryAddressSendMsg(rumor, 'rumor');
            break;
        }
        case 'msg':
        {
            let msgType = arg.options.type || await readLine('Enter message type:');
            let msg = arg.options.msg || await readLine('Enter message content:');
            await queryAddressSendMsg(msg, msgType);
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
            return true;
        }
        case '?':
        case 'help':
        {
            console.log('init: Initialize distribution of a rumor.');
            console.log('stop: Stop one rumor node');
            console.log('stop all: Stop all rumor nodes');
            console.log('exit: Exit this program');
            console.log('?: Display this help');
            break;
        }
        default: {
            throw new Error('Unknown command ' + cmd);
        }
    }
    return false;
}

async function dialog() {
    let exit = false;
    while(!exit) {
        let cmd = await readLine('Enter command:');
        try {
            exit = await execCommand(cmd);
        } catch(e) {
            if (!e.stack) console.error(e);
            else console.error(e.stack)
        }
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
