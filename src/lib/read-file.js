let fs = require('fs');

let readFile = function (filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, 'utf8', (error, data) => {
            if (error) {
                reject(`Could not read file "${filename}"`);
            } else {
                resolve(data);
            }
        })
    });
};

module.exports = readFile;