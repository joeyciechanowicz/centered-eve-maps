import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import cola from 'cytoscape-cola';

cytoscape.use(cola);
cytoscape.use(coseBilkent);

const colors = {
  1.0: '#2FEFEF',
  0.9: '#48F0C0',
  0.8: '#00EF47',
  0.7: '#00F000',
  0.6: '#8FEF2F',
  0.5: '#EFEF00',
  0.4: '#D77700',
  0.3: '#F06000',
  0.2: '#F04800',
  0.1: '#D73000',
  0.0: '#F00000'
};

const lighterColors = {
  1.0: '#7AC9B0',
  0.9: '#95FFFF',
  0.8: '#7FFFC6',
  0.7: '#99FF99',
  0.6: '#F5FF95',
  0.5: '#FFFF66',
  0.4: '#FFDD66',
  0.3: '#FFC666',
  0.2: '#FFAE66',
  0.1: '#FF9666',
  0.0: '#FF6666'
};

function mapSecurityColor(ele) {
  const security = ele.data('security');
  if (security < 0.0) return colors[0.0];
  return colors[security];
}

function mapBackgroundSecurityColor(ele) {
  const security = ele.data('security');
  if (security < 0.0) return lighterColors[0.0];
  return lighterColors[security];
}


const stop = () => {
  document.getElementById('draw-network').classList.remove('disabled');
};

const coseBilkentLayout = {
  name: 'cose-bilkent',
  nodeDimensionsIncludeLabels: true,
  fit: true,
  randomize: false,
  idealEdgeLength: 50,
  edgeElasticity: 0.65,
  nodeRepulsion: 7000,
  nestingFactor: 0.5,
  refresh: 1,
  animate: 'end',
  numIter: 5000,
  stop
};

const colaLayout = {
  name: 'cola',
  refresh: 5,
  maxSimulationTime: 10000,
  stop
};

const styles = [
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
      'border-color': mapSecurityColor,
      'background-color': mapBackgroundSecurityColor,
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
];

export function drawNetwork(graph, startSystem, nodeSelected, nodeAltSelected) {
  const elements = graph.vertices.concat(graph.edges);

  const cy = cytoscape({
    container: document.getElementById('cy'),
    elements,
    style: styles,
    layout: coseBilkentLayout
  });

  cy.getElementById(startSystem).style('border-width', '6px');

  cy.$('.child').on('tap', (e) => {
    nodeSelected(e.target.data('name'));
  });

  cy.$('.child').on('cxttap', (e) => {
    nodeAltSelected(e.target.data('name'));
  });
}
