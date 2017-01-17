let readLine = require('./../lib/read-line');
let writeFile = require('./../lib/write-file');
import { EdgeGenerator } from './helpers/edgeGenerator';

let optionParser = require('node-getopt').create([
        ['n', 'n=[ARG]', 'Number of nodes'],
        ['m', 'm=[ARG]', 'Number of edges'],
        ['f', 'filename=[ARG]', 'Filename'],
        ['h', 'help', 'Display this help']
    ]);

let arg = optionParser.bindHelp().parseSystem();

async function readArguments(args) {
    let n, m, filename;
    let gotInput = false;
    while(!gotInput) {
        n = parseInt(args.n || await readLine('Please enter the number of nodes:'), 10);
        m = parseInt(args.m || await readLine('Please enter the number of edges:'), 10);
        if (m > n) {
            gotInput = true;
        } else {
            console.log('The number of edges must be greater than the number of nodes')
        }
    }
    filename = args.filename || await readLine('Please enter a filename:');
    return {
        n: n,
        m: m,
        filename: filename
    }
}


async function main() {
    try {
        let args = {
            n: arg.options.n,
            m: arg.options.m,
            filename: arg.options.filename
        };

        args = await readArguments(args);
        let edgeGenerator = new EdgeGenerator(args.n, args.m);
        edgeGenerator.createEdges();
        let data = edgeGenerator.generateGraphvizData();
        try {
            await writeFile(args.filename, data);
        } catch (e) {
            console.log(e);
        }
        process.exit();
    } catch(e) {
        console.error('Caught exception: ' + e);
    }
}

main();