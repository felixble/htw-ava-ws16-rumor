let randomstring = require('randomstring');

export class Random {

    static randomNumber(min, max) {
        return Math.floor(Math.random()*(max-min+1)+min);
    }

    static randomBoolean() {
        return !!Random.randomNumber(0, 1);
    }

    static generateId() {
        return randomstring.generate(7);
    }

    static getRandomElementFromArray(array) {
        let maxIndex = array.length - 1;
        let randomIndex = Random.randomNumber(0, maxIndex);
        return array[randomIndex];
    }

}