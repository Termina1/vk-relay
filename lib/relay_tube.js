var factory = require('./relay_factory');
var through = require('through2');

function dispatch(tube, api, relay) {
  return relay(api, tube);
}

function pause(secs) {
  return new Promise((res) => {
    setTimeout(res, secs * 1000);
  })
}

function relayTube(relays, api) {
  var tube = through.obj({
    highWaterMark: 10000
  }, function(el, tp, cb) {
    cb(null, el);
  });

  var relays = relays.map(factory)
    .reduce((acc, el) => (
      acc
        .then(_ => dispatch(tube, api, el))
        .then(_ => pause(5))
        .catch(err => {
          console.log(error)
          return true;
        })
    ), Promise.resolve());

    // relays
    //   .then(_ => tube.end())
    //   .catch(_ => tube.end());

  return tube;
}

module.exports = relayTube;
