
export class Random {

    static randomNumber(min, max) {
        return Math.floor(Math.random()*(max-min+1)+min);
    }

    static randomBoolean() {
        return !!Random.randomNumber(0, 1);
    }

}