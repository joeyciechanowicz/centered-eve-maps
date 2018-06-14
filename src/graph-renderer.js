import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import {colors, lighterColors} from './constants';
cytoscape.use(coseBilkent);



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
export class GraphRenderer {
  constructor() {

  }

	drawNetwork(graph, markedSystems, nodeSelected, nodeAltSelected) {
		const elements = graph.vertices.concat(graph.edges);

		const cy = cytoscape({
			container: document.getElementById('cy'),
			elements,
			style: styles,
			layout: coseBilkentLayout
		});

		markedSystems.forEach(system => {
			cy.getElementById(system).style('border-width', '6px');
		});

		cy.$('.child').on('tap', (e) => {
			nodeSelected(e.target.data('name'));
		});

		cy.$('.child').on('cxttap', (e) => {
			nodeAltSelected(e.target.data('name'));
		});
	}
}
