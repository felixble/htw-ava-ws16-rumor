let readLine = require('./../lib/read-line');
let writeFile = require('./../lib/write-file');
import { ElectionGraph } from './helpers/electionGraph';
import { GraphvizWriter } from './helpers/graphvizWriter';

let optionParser = require('node-getopt').create([
        ['n', 'n=[ARG]', 'Number of nodes'],
        ['s', 'supporter=[ARG]', 'Number of supporters'],
        ['f', 'friends=[ARG]', 'Number of friends'],
        ['o', 'out=[ARG]', 'Output filename'],
        ['h', 'help', 'Display this help']
    ]);

let arg = optionParser.bindHelp().parseSystem();

async function readArguments(args) {
    let n, supporter, friends, out;
    n = parseInt(args.n || await readLine('Please enter the number of nodes:'), 10);
    supporter = parseInt(args.supporter || await readLine('Please enter the degree for each candidate node:'), 10);
    friends = parseInt(args.friends || await readLine('Please enter the degree for each voter node:'), 10);
    out = args.out || await readLine('Please enter a filename:');
    return {
        n: n,
        supporter: supporter,
        friends: friends,
        out: out
    }
}


async function main() {
    try {
        let args = {
            n: arg.options.n,
            supporter: arg.options.supporter,
            friends: arg.options.friends,
            out: arg.options.out
        };

        args = await readArguments(args);

        let electionGraph = new ElectionGraph(args.n, args.supporter, args.friends);
        let graph = electionGraph.generate();
        let data = GraphvizWriter.edgesArrayToGraphvizData(graph.edges);
        try {
            await writeFile(args.out, data);
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