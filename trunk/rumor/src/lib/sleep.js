let sleep = function(ms = 1000) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
};

module.exports = sleep;