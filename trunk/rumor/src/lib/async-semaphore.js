
export class Semaphore {

    constructor(capacity) {
        this.sem = require('semaphore')(capacity);
    }

    take() {
        return new Promise(resolve => {
            this.sem.take(resolve);
        })
    }

    leave() {
        this.sem.leave();
    }

}