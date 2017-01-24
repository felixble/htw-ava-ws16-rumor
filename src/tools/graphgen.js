let readLine = require('./../lib/read-line');
let writeFile = require('./../lib/write-file');
import { ElectionGraph } from './helpers/electionGraph';
import { GraphvizWriter } from './helpers/graphvizWriter';

let optionParser = require('node-getopt').create([
        ['n', 'n=[ARG]', 'Number of nodes'],
        ['m', 'm=[ARG]', 'Number of edges'],
        ['f', 'filename=[ARG]', 'Filename'],
        ['h', 'help', 'Display this help']
    ]);

let arg = optionParser.bindHelp().parseSystem();

async function readArguments(args) {
    let n, m, filename;
    n = parseInt(args.n || await readLine('Please enter the number of nodes:'), 10);
    m = parseInt(args.m || await readLine('Please enter the degree for each node:'), 10);
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

        let electionGraph = new ElectionGraph(args.n, 2, args.m);
        let graph = electionGraph.generate();
        let data = GraphvizWriter.edgesArrayToGraphvizData(graph.edges);
        try {
            await writeFile(args.filename, data);
        } catch (e) {
            console.log(e);
        }
        process.exit();
    } catch(e) {
        if (!e.stack) console.error(e);
        else console.error(e.stack);
    }
}

main();