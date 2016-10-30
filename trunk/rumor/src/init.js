
import { Client } from './lib/client';

async function main() {
    let client = new Client('127.0.0.1', 6000);
    await client.connect();
    await client.send({msg: 'init'});
    client.close();
}

main();