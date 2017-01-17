

export class ArrayHelpers {

    static findElementById(array, id) {
        let index = ArrayHelpers.getElementIndexById(array, id);
        return (index === undefined) ? undefined : array[index];
    }

    static getElementIndexById(array, id) {
        for(let i=0; i<array.length; i++) {
            let element = array[i];
            if (element.id === id) {
                return i;
            }
        }
        return undefined;
    }
}