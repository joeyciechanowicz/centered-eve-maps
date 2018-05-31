// const restify = require('restify');

// function respond(req, res, next) {
//   // res.send('hello ' + req.params.name);
//   next();
// }
//
// const server = restify.createServer();
// server.get('/around/:system', respond);
//
// server.listen(8080, function() {
//   console.log('%s listening at %s', server.name, server.url);
// });

const universe = require('./translated-universe');

const nameLookup = universe.reduce((lookup, x, idx) => {
  lookup[x[0]] = idx;
  return lookup;
}, {});

console.log(universe[nameLookup['J152654']]);

function getNeighbourhood(system, depth) {
  if (!universe.names[system]) {
    throw new Error(`Unknown system ${system}`);
  }

  const nodes = {};


}
