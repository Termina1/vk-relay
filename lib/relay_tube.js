var factory = require('./relay_factory');
var through = require('through2');

function dispatch(tube, api, relay) {
  return relay(api, tube);
}

function relayTube(relays, api) {
  var tube = through.obj(function(el, tp, cb) {
    cb(null, el);
  });

  var relays = relays.map(factory)
    .reduce((acc, el) => (acc.then(_ => dispatch(tube, api, el))), Promise.resolve());

    relays
      .then(_ => tube.end())
      .catch(_ => tube.end());

  return tube;
}

module.exports = relayTube;
