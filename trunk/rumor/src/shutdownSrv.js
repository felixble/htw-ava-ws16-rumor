import { Server } from './lib/server';
import { Semaphore } from './lib/async-semaphore'

let sleep = require('./lib/sleep');

let sem = new Semaphore(1);

let killed = false;

async function main() {
    let srv = new Server('0.0.0.0', 6000);
    await srv.listen(async (socket, data) => {
        socket.write(JSON.stringify({}));
        await sem.take();
        console.log('incoming msg ' + data.msg);

        if (killed) {
            sem.leave();
            return;
        }

        await sleep(10000);

        if (data.msg === 'stop') {
            killed = true;
            srv.close();
        }

        console.log('message verarbeitet');
        sem.leave();
    });

    console.log('ENDE');
}

main();
