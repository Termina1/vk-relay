var relayTube = require('./relay_tube');
var relayTrap = require('./relay_trap');

function relay(group, type) {
  if (group.domain) {
    return {
      domain: group.domain,
      type: type,
      target: group.target,
      start: new Date(group.start)
    };
  } else {
    return {
      id: group.id,
      type: type,
      target: group.target,
      start: new Date(group.start)
    };
  }
}

function crawl(config, api) {
  var relays = config.groups
    .reduce((acc, group) =>
      (acc.concat(group.relay.map(el => [group, el]))), [])
    .map(el => relay(...el));

  relayTube(relays, api).pipe(relayTrap(api));

}


module.exports = crawl;
