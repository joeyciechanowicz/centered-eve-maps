import './bootstrap.min.css';
import uni from './translated-universe';

import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import cola from 'cytoscape-cola';
import {EDGES, NAME, REGION, SECURITY} from './constants';

cytoscape.use(cola);
cytoscape.use(coseBilkent);

const nameLookup = uni.reduce((lookup, x, idx) => {
  lookup[x[0]] = idx;
  return lookup;
}, {});

function getNeighbourhoodGraph(system, depth) {
  const nodeIndexesAdded = {
    [nameLookup[system]]: true
  };

  let nodesToCheck = uni[nameLookup[system]][EDGES];

  for (let i = 0; i < depth; i++) {
    nodesToCheck = nodesToCheck.map(nodeIndex => {
      if (nodeIndexesAdded[nodeIndex]) {
        return [];
      }

      nodeIndexesAdded[nodeIndex] = true;
      return uni[nodeIndex][EDGES];
    }).reduce((prev, curr) => prev.concat(curr), []);
  }

  const edgesAdded = {};
  const regionsAdded = {};
  const edges = [];
  const vertices = [];

  Object.keys(nodeIndexesAdded).forEach(sourceNodeIndex => {
    const sourceNode = uni[sourceNodeIndex];

    const vertex = {
      data: {
        id: sourceNode[NAME],
        name: sourceNode[NAME],
        security: sourceNode[SECURITY],
        parent: sourceNode[REGION],
      },
      classes: 'child'
    };

    vertices.push(vertex);

    if (!regionsAdded[vertex[REGION]]) {
      const regionVertex = {
        data: {
          id: sourceNode[REGION],
          name: sourceNode[REGION]
        }
      };
      vertices.push(regionVertex);
      regionsAdded[sourceNode[REGION]] = true;
    }

    uni[sourceNodeIndex][EDGES].forEach(targetNodeIndex => {
      if (nodeIndexesAdded[targetNodeIndex] && !edgesAdded[`${sourceNodeIndex}:${targetNodeIndex}`]) {
        edges.push({
          data: {
            id: sourceNode[NAME] + uni[targetNodeIndex][NAME],
            source: sourceNode[NAME],
            target: uni[targetNodeIndex][NAME]
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

const stop = () => {
  document.getElementById('draw-network').classList.remove('disabled');
};

const coseBilkentLayout = {
  name: 'cose-bilkent',
  nodeDimensionsIncludeLabels: false,
  refresh: 30,
  fit: true,
  padding: 10,
  randomize: false,
  animate: 'during',
  stop
};

const colaLayout = {
  name: 'cola',
  refresh: 30,
  stop
};

function drawNetwork(system, depth) {
  const graph = getNeighbourhoodGraph(system, depth);

  const elements = graph.vertices.concat(graph.edges);

  const cy = cytoscape({
    container: document.getElementById('cy'),
    elements,
    style: [
      {
        selector: ':parent',
        style: {
          label: 'data(name)',
          'text-valign': 'top',
          padding: '10px'
        }
      },
      {
        selector: '.child',
        style: {
          shape: 'roundrectangle',
          width: 'label',
          height: 'label',
          'border-width': '2px',
          'border-style': 'solid',
          'border-color': 'mapData(security, -1.0, 1.0, red, green)',
          'background-color': 'mapData(security, -1.0, 1.0, #ea9999, #b6d7a8)',
          content: 'data(name)',
          'text-valign': 'center',
          'text-halign': 'center',
          padding: '4px',
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 3,
          'line-color': '#ccc'
        }
      }
    ],
    layout: coseBilkentLayout
  });

  cy.getElementById(system).style('border-width', '6px');
}


document.getElementById('draw-network').addEventListener('click', function (event) {
  event.srcElement.classList.add('disabled');
  const systemGroup = document.getElementById('system-group');
  const depthGroup = document.getElementById('depth-group');
  const systemHelpText = document.getElementById('system-help-text');
  const depthHelpText = document.getElementById('depth-help-text');

  systemGroup.classList.remove('has-error');
  depthGroup.classList.remove('has-error');
  systemHelpText.innerText = '';
  depthHelpText.innerText = '';

  const system = document.getElementById('system').value;
  if (!nameLookup[system]) {
    systemHelpText.innerText = `Unknown system ${system}`;
    systemGroup.classList.add('has-error');
    return;
  }

  const depth = parseInt(document.getElementById('depth').value);
  if (isNaN(depth)) {
    depthGroup.classList.add('has-error');
    depthHelpText.innerText = 'Invalid number';
    return;
  }

  drawNetwork(system, depth);
});

drawNetwork('Tama', 4);
