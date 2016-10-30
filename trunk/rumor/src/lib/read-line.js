let prompt = require('prompt');
prompt.message = "";
prompt.delimiter = "";

let readLine = function(message) {
    prompt.start();

    let schema = {
        properties: {
            string: {
                description: message,
                type: 'string'
            }
        }
    };

    return new Promise((resolve, reject) => {
        prompt.get(schema, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result.string);
            }
        });
    });
};

module.exports = readLine;