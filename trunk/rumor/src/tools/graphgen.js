let readLine = require('./../lib/read-line');
let writeFile = require('./../lib/write-file');
let edgeGenerator = require('./helpers/edgeGenerator');

async function readArguments() {
    let n, m, filename;
    let gotInput = false;
    while(!gotInput) {
        n = parseInt(await readLine('Please enter the number of nodes:'));
        m = parseInt(await readLine('Please enter the number of edges:'));
        if (m > n) {
            gotInput = true;
        } else {
            console.log('The number of edges must be greater than the number of nodes')
        }
    }
    filename = await readLine('Please enter a filename:');
    return {
        n: n,
        m: m,
        filename: filename
    }
}


async function main() {
    let args = await readArguments();
    let edges = edgeGenerator.createEdges(args.n, args.m);
    let data = edgeGenerator.generateGraphvizData(edges);
    try {
        await writeFile(args.filename, data);
    } catch (e) {
        console.log(e);
    }
    process.exit();
}

main();