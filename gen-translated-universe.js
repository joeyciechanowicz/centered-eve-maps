const fs = require('fs');
const universe = require('./universe_pretty');

const nodeNameToIndex = {};
const arrayOfNodes = [];

/* Nodes are in the form
* [
*   name,
*   security,
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
  return [
    x.name,
    x.security,
    x.edges
  ];
});

fs.writeFileSync('./translated-universe.json', JSON.stringify(nodes));
