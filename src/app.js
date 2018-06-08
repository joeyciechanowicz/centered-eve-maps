import './bootstrap.min.css';
import uni from './translated-universe';
import {EDGES, NAME, REGION, SECURITY} from './constants';
import {drawNetwork} from './graph-display';

const nameLookup = uni.nodes.reduce((lookup, x, idx) => {
  lookup[x[0]] = idx;
  return lookup;
}, {});

function PriorityQueue() {
  this._nodes = [];

  this.enqueue = function (priority, key) {
    this._nodes.push({key: key, priority: priority});
    this.sort();
  };
  this.dequeue = function () {
    return this._nodes.shift().key;
  };
  this.sort = function () {
    this._nodes.sort(function (a, b) {
      return a.priority - b.priority;
    });
  };
  this.isEmpty = function () {
    return !this._nodes.length;
  };
}

const INFINITY = 1 / 0;

function shortestPath(startNodeIndex, finishNodeIndex) {
  const nodes = new PriorityQueue(),
    distances = {},
    previous = {};
  let path = [];
  let smallest;

  for (let vertexIndex = 0; vertexIndex < uni.nodes.length; vertexIndex++) {
    if (vertexIndex === startNodeIndex) {
      distances[vertexIndex] = 0;
      nodes.enqueue(0, vertexIndex);
    }
    else {
      distances[vertexIndex] = INFINITY;
      nodes.enqueue(INFINITY, vertexIndex);
    }

    previous[vertexIndex] = null;
  }

  while (!nodes.isEmpty()) {
    smallest = nodes.dequeue();

    if (smallest === finishNodeIndex) {
      path = [];

      while (previous[smallest]) {
        path.push(smallest);
        smallest = previous[smallest];
      }

      break;
    }

    if (!smallest || distances[smallest] === INFINITY) {
      continue;
    }

    uni.nodes[smallest][EDGES].forEach(neighbor => {
      const alt = distances[smallest] + 1;

      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        previous[neighbor] = smallest;

        nodes.enqueue(alt, neighbor);
      }
    });
  }

  return path;
}

function getNeighbourhoodGraph(system, ignore, depth, include) {
  const nodeIndexesAdded = {
    [nameLookup[system]]: true
  };

  const ignoreLookup = ignore.reduce((map, x) => {
    map[nameLookup[x]] = true;
    return map;
  }, {});

  let nodesToCheck = uni.nodes[nameLookup[system]][EDGES]
    .filter(node => !ignoreLookup[node]);

  for (let i = 0; i < depth; i++) {
    nodesToCheck = nodesToCheck.map(nodeIndex => {
      if (nodeIndexesAdded[nodeIndex]) {
        return [];
      }

      nodeIndexesAdded[nodeIndex] = true;
      return uni.nodes[nodeIndex][EDGES].filter(node => !ignoreLookup[node]);
    }).reduce((prev, curr) => prev.concat(curr), []);
  }

  const edgesAdded = {};
  const regionsAdded = {};
  const edges = [];
  const vertices = [];

  // Calculate shortest path to all the systems given
  include.filter(includeSystem => !nodeIndexesAdded[nameLookup[includeSystem]])
    .map(includeSystem => shortestPath(nameLookup[system], nameLookup[includeSystem]))
    .forEach(path => {
      path.forEach(nodeIndex => nodeIndexesAdded[nodeIndex] = true);
    });

  Object.keys(nodeIndexesAdded).forEach(sourceNodeIndex => {
    const sourceNode = uni.nodes[sourceNodeIndex];

    const vertex = {
      data: {
        id: sourceNode[NAME],
        name: sourceNode[NAME],
        security: sourceNode[SECURITY],
        parent: 'p' + sourceNode[REGION],
      },
      classes: 'child'
    };

    vertices.push(vertex);

    if (!regionsAdded[vertex[REGION]]) {
      const regionVertex = {
        data: {
          id: 'p' + sourceNode[REGION],
          name: uni.regions[sourceNode[REGION]]
        }
      };
      vertices.push(regionVertex);
      regionsAdded[sourceNode[REGION]] = true;
    }

    uni.nodes[sourceNodeIndex][EDGES].forEach(targetNodeIndex => {
      if (nodeIndexesAdded[targetNodeIndex] && !edgesAdded[`${sourceNodeIndex}:${targetNodeIndex}`]) {
        edges.push({
          data: {
            id: sourceNode[NAME] + uni.nodes[targetNodeIndex][NAME],
            source: sourceNode[NAME],
            target: uni.nodes[targetNodeIndex][NAME]
          }
        });
        edgesAdded[`${sourceNodeIndex}:${targetNodeIndex}`] = true;
      }
    });
  });

  return {
    vertices,
    edges
  };
}

function nodeSelected(nodeName) {
  const element = document.getElementById('system');
  element.value = nodeName;
  element.classList.remove('flash');
  setTimeout(() => {
    element.classList.add('flash');
  }, 1);
}

function nodeAltSelected(nodeName) {
  const element = document.getElementById('ignore');

  if (element.value.indexOf(nodeName) !== -1) {
    return;
  }

  if (element.value.length === 0) {
    element.value = nodeName;
  } else {
    element.value += `, ${nodeName}`;
  }

  element.classList.remove('flash');
  setTimeout(() => {
    element.classList.add('flash');
  }, 30);
}

function run() {
  const button = document.getElementById('draw-network');
  if (button.classList.contains('disabled')) return;

  button.classList.add('disabled');
  const systemGroup = document.getElementById('system-group');
  const depthGroup = document.getElementById('depth-group');
  const ignoreGroup = document.getElementById('ignore-group');
  const includeGroup = document.getElementById('include-group');

  const systemHelpText = document.getElementById('system-help-text');
  const depthHelpText = document.getElementById('depth-help-text');
  const ignoreHelpText = document.getElementById('ignore-help-text');
  const includeHelpText = document.getElementById('include-help-text');

  systemGroup.classList.remove('has-error');
  depthGroup.classList.remove('has-error');
  ignoreGroup.classList.remove('has-error');
  includeGroup.classList.remove('has-error');

  systemHelpText.innerText = '';
  depthHelpText.innerText = '';
  ignoreHelpText.innerText = '';
  includeHelpText.innerText = '';

  const system = document.getElementById('system').value;
  if (!nameLookup[system]) {
    systemHelpText.innerText = `Unknown system ${system}`;
    systemGroup.classList.add('has-error');
    return;
  }

  const ignore = document.getElementById('ignore').value
    .split(',')
    .map(x => x.trim())
    .filter(x => x !== '');
  if (ignore.some(x => !nameLookup[x])) {
    ignoreGroup.classList.add('has-error');
    ignoreHelpText.innerText = 'Unknown system';
    return;
  }

  const depth = parseInt(document.getElementById('depth').value);
  if (isNaN(depth)) {
    depthGroup.classList.add('has-error');
    depthHelpText.innerText = 'Invalid number';
    return;
  }

  const include = document.getElementById('include').value
    .split(',')
    .map(x => x.trim())
    .filter(x => x !== '');
  if (include.some(x => !nameLookup[x])) {
    includeGroup.classList.add('has-error');
    includeHelpText.innerText = 'Unknown system';
    return;
  }

  const graph = getNeighbourhoodGraph(system, ignore, depth, include);
  drawNetwork(graph, [system].concat(include), nodeSelected, nodeAltSelected);
}

document.getElementById('draw-network').addEventListener('click', run);

run();
