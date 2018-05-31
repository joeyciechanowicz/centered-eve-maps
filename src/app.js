import {
  drag,
  event,
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  scaleOrdinal,
  select
} from 'd3';

import uni from './translated-universe';

// Our lookups in the universe
const NAME = 0;
const SECURITY = 1;
const EDGES = 2;

const width = window.innerWidth;
const height = window.innerHeight;
const sizeDivisor = 100, nodePadding = 2.5;

const svg = select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const simulation = forceSimulation()
  .force('link', forceLink().id(d => d.name))
  .force('charge', forceManyBody())
  .force('center', forceCenter(width / 2, height / 2));

const nameLookup = uni.reduce((lookup, x, idx) => {
  lookup[x[0]] = idx;
  return lookup;
}, {});

function getNeighbourhoodGraph(system, depth) {
  if (!nameLookup[system]) {
    throw new Error(`Unknown system ${system}`);
  }

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
  const edges = [];
  const vertices = [];

  Object.keys(nodeIndexesAdded).forEach(sourceNodeIndex => {
    const sourceNode = uni[sourceNodeIndex];

    const vertex = {
      name: sourceNode[NAME],
      security: sourceNode[SECURITY],
      group: 1
    };

    if (vertex.name === system) {
      vertex.fx = height / 2;
      vertex.fy = height / 2;
    }

    vertices.push(vertex);

    uni[sourceNodeIndex][EDGES].forEach(targetNodeIndex => {
      if (nodeIndexesAdded[targetNodeIndex] && !edgesAdded[`${sourceNodeIndex}:${targetNodeIndex}`]) {
        edges.push({
          source: sourceNode[NAME],
          target: uni[targetNodeIndex][NAME],
          value: 5
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

const color = scaleOrdinal([
  '#2FEFEF', '#48F0C0', '#00EF47', '#00F000', '#8FEF2F', '#EFEF00', '#D77700', '#F06000',
  '#F04800', '#D73000', '#F00000'
]);

const padding = 2;

function drawNetwork(system, depth) {
  const graph = getNeighbourhoodGraph(system, depth);

  const node = svg.append('g')
    .attr('class', 'node')
    .selectAll('rect')
    .data(graph.vertices)
    .enter().append('rect')
    .attr('width', function(d) { return d.name.length + 2 * padding; })
    .attr('height', 10)
    .attr('fill', function(d) { return color(d.security); })
    .attr('x', function(d){ return d.x; })
    .attr('y', function(d){ return d.y; });

  const link = svg.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(graph.edges)
    .enter().append('line');

  simulation
    .nodes(graph.vertices)
    .force('collide', forceCollide()
      .strength(.5)
      .radius((d) => d.name.length + nodePadding)
      .iterations(1)
    )
    .on('tick', ticked);

  simulation.force('link')
    .links(graph.edges);

  function ticked() {
    link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    node
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
  }
}

function drawEdge(d) {
  context.moveTo(d.source.x, d.source.y);
  context.lineTo(d.target.x, d.target.y);
}

function drawVertex(d) {
  context.moveTo(d.x + 15, d.y);
  context.arc(d.x, d.y, 15, 0, 2 * Math.PI);
}


drawNetwork('Mahtista', 3);
