

let randInt = function (min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
};

let rand = function (max) {
    return randInt(1, max-1);
};

let containsEdge = function(edge, edges) {
    let a = edge[0];
    let b = edge[1];
    let contains = false;
    edges.some(e => {
        if (e.indexOf(a) !== -1 && e.indexOf(b) !== -1 ) {
            contains = true;
            return true;
        }
        return false;
    });
    return contains;
};

let createEdges = function (n, m) {
    let edges = [];
    while (edges.length < m) {
        for (let i = 2; i <= n; i++) {
            let j = rand(i);
            let edge = [i, j];
            edges.push(edge);
            if (edges.length >= m) {
                break;
            }
        }
    }
    return edges;
};

let generateGraphvizData = function(edges) {
    let result = 'graph G {\n';
    edges.forEach(node => {
        let a = node[0];
        let b = node[1];
        result += `${a} -- ${b};\n`;
    });
    return result += '}';
};

module.exports = {
    createEdges: createEdges,
    rand: rand,
    generateGraphvizData: generateGraphvizData,
    containsEdge: containsEdge
};