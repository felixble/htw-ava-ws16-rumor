import {_} from 'underscore';
let spawn = require('child-process-promise').spawn;

const NUMBER_OUTPUT_LINES_PER_PROCESS = 4;

export class SpawnElectionNodes {

    constructor(numberOfNodes, numberOfReceives, graphFile) {
        this.numberOfNodes = numberOfNodes;
        this.numberOfReceives = numberOfReceives;
        this.graphFile = graphFile;
        this.childStdOutLineCount = 0;
        this.numberOfStartedNodes = 0;
        this.resolveSpawn = null;
        this.rejectSpawn = null;
        this.finishedElectionCallback = null;
    }

    setFinishedElectionCallback(finishedElectionCallback) {
        this.finishedElectionCallback = finishedElectionCallback;
    }

    async spawnObserver() {
        return new Promise((resolve, reject) => {
            this.numberOfStartedNodes = 1;
            this.resolveSpawn = resolve;
            this.rejectSpawn = reject;
            this.startObserverNode();
        });
    }

    startObserverNode() {
        this._startNode(`--id 0 --observer`.split(' '));
    }

    async spawn() {
        return new Promise((resolve, reject) => {
            this.numberOfStartedNodes = this.numberOfNodes;
            this.resolveSpawn = resolve;
            this.rejectSpawn = reject;
            for (let i=1; i<=this.numberOfNodes; i++) {
                this.startElectionNode(i);
            }
        });
    }

    startElectionNode(nodeId) {
        this._startNode(this._electionNodeArgs(nodeId));
    }

    _startNode(args) {
        let baseArgs = `run start-node -- -g ${this.graphFile}`.split(' ');
        let promise = spawn('npm', baseArgs.concat(args));
        let childProcess = promise.childProcess;

        childProcess.stdout.on('data', _.bind(this._readProcessStdOut, this));
        childProcess.stderr.on('data', _.bind(this._readProcessStdErr, this));

        promise.then(() => console.log('[spawn] done!'))
            .catch((error) => {console.error(`[spawn] error: ${error}`)});
    }

    _electionNodeArgs(nodeId) {
        return `--id ${nodeId} -r ${this.numberOfReceives}`.split(' ')
    }

    async _readProcessStdOut(data) {
        let text = data.toString();
        this.childStdOutLineCount += SpawnElectionNodes.countNonEmptyLines(text);
        if (this._allChildsStarted()) {
            this.childStdOutLineCount = 0;
            this.resolveSpawn();
        }
        if (text.split(/\s+/)[1] === '(0)') {
            console.log(text);
        }

        if (text.startsWith('FINISH') && this.finishedElectionCallback) {
            let result = JSON.parse(text.split(/\s+/)[10]);
            this.finishedElectionCallback(result);
        }
    }

    static countNonEmptyLines(text) {
        return text.split('\n').filter(line => { return line.trim() !== '' }).length;
    }

    _allChildsStarted() {
        return (this.childStdOutLineCount >= NUMBER_OUTPUT_LINES_PER_PROCESS * this.numberOfStartedNodes);
    }

    _readProcessStdErr(data) {
        this.rejectSpawn(data.toString());
        console.error(data.toString());
    }

}