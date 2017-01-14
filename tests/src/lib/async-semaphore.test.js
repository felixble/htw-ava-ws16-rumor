let expect = require('chai').expect;

import { Semaphore } from '../../../src/lib/async-semaphore';

class Phone {
    constructor() {
        this.state = 'free';
    }

    dial() {
        return new Promise((resolve, reject) => {
            if (this.state !== 'free') {
                reject(new Error('The phone is busy'));
            } else {
                this.state = 'busy';
                setTimeout(resolve, 100);
            }
        });
    }

    hangup() {
        if (this.state == "free") {
            throw new Error("The phone is not in use");
        }

        this.state = "free";
    }
}

describe('Semaphore', function() {

    let phone,
        sema;

    beforeEach(function() {
        sema = new Semaphore(1);
        phone = new Phone();
    });

    it('should only make one call at once', function(done) {
        expect(sema.currentValue(), 'initial value of the semaphore should be 0').to.equal(0);
        // call Bob
        sema.take()
            .then(() => {
                expect(sema.currentValue(), 'value after taking the semaphore should be 1').to.equal(1);
                phone.dial()
                    .then(() => {
                        phone.hangup();
                        sema.leave();
                    })
                    .catch(done);
            })
            .catch(done);


        // call Alice
        sema.take()
            .then(() => {
                console.log(sema.currentValue());
                phone.dial()
                    .then(() => {
                        expect(sema.currentValue(), 'value after taking the semaphore should be 1, too').to.equal(1);
                        phone.hangup();
                        sema.leave();
                        done();
                    })
                    .catch(done);
            })
            .catch(done);

    });

});