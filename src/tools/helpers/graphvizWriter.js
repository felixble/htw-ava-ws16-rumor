

export class GraphvizWriter {

    static edgesArrayToGraphvizData(edges, nodeIdOffset = 0) {
        let result = 'graph G {\n';
        edges.forEach(node => {
            let a = node[0] + nodeIdOffset;
            let b = node[1] + nodeIdOffset;
            result += `${a} -- ${b};\n`;
            });
        result += '}';
        return result;
    }

}