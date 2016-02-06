var postRelay = require('./relays/post_relay');

module.exports = function(relay) {
  switch(relay.type) {
    case 'posts':
      return postRelay(relay);
  }
}
