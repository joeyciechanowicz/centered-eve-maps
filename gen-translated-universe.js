const {EDGES, NAME, REGION, SECURITY} = require('./src/constants');


const fs = require('fs');
const universe = require('./universe_pretty');

const nodeNameToIndex = {};
const arrayOfNodes = [];


/* Nodes are in the form
* [
*   name,
*   security,
*   region: region-index
*   edges[]
*  ];
*
*  for example
*  [0, 0.8, [2,4,6]] has name = .names[0], security 0.8, and connections to 2, 4, &
*/
Object.keys(universe.nodes).forEach((curr, idx) => {
  nodeNameToIndex[curr] = idx;
  const node = universe.nodes[curr];
  arrayOfNodes.push({
    name: node.name,
    security: Math.round(node.security * 10) / 10,
    region: node.region,
    edges: []
  });
});

universe.edges.forEach((edge, idx) => {
  const translatedEdge = {
    from: nodeNameToIndex[edge.from],
    to: nodeNameToIndex[edge.to]
  };

  arrayOfNodes[translatedEdge.from].edges.push(translatedEdge.to);
  arrayOfNodes[translatedEdge.to].edges.push(translatedEdge.from);

  if (translatedEdge.from === undefined || translatedEdge.to === undefined) {
    throw new Error(`Couldn't translated on edge at idx: ${idx}`);
  }
});

universe.edges.forEach((edge, idx) => {
  const translatedEdge = {
    from: nodeNameToIndex[edge.from],
    to: nodeNameToIndex[edge.to]
  };

  if (arrayOfNodes[translatedEdge.to].edges.indexOf(translatedEdge.from) === -1) {
    throw new Error(`Edges not set up in both to-from directions for edge: ${JSON.stringify(translatedEdge)}`);
  }

  if (arrayOfNodes[translatedEdge.from].edges.indexOf(translatedEdge.to) === -1) {
    throw new Error(`Edges not set up in both from-to directions for edge: ${JSON.stringify(translatedEdge)}`);
  }
});

const nodes = arrayOfNodes.map(x => {
  const node = new Array(4);
  node[NAME] = x.name;
  node[SECURITY] = x.security;
  node[REGION] = x.region;
  node[EDGES] = x.edges;
  return node;
});

fs.writeFileSync('./translated-universe.json', JSON.stringify(nodes));
