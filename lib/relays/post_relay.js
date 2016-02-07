var redis = require('../redis');
var pause = require('../utils').pause;

const LIMIT = 100;
const MORE_DELAY = 1000;

function compareDate(a, item) {
  var t = new Date(item.date * 1000);
  return a.getTime() - t.getTime();
}

function compareIds(a, item) {
  return a - item.id;
}

function getRelayLimit(relay) {
  var param = relay.id ? relay.id : relay.domain;
  return "relay_posts_" + param;
}

function repostTrap(relay, post) {
  console.log("wall" + post.owner_id + "_" + post.id, "request");
  return {
    type: "message",
    id: "wall" + post.owner_id + "_" + post.id,
    target: relay.target
  };
}

function recievePosts(relay, tube, result) {
  return new Promise((full) => {
    redis.get(getRelayLimit(relay), (err, res) => {
      if (err) {
        throw new Error(err);
      }
      full(res);
    });
  }).then((limit) => {
    limit = limit ? parseInt(limit) : null;
    var compare = limit ? compareIds.bind(null, limit) : compareDate.bind(null, relay.start);
    if (result.length <= 0) {
      return [limit, false];
    }
    var items = result.items.sort(compare)
      .filter(el => !el.is_pinned);
    var needItems = items
      .filter(el => compare(el) < 0);
    if (needItems.length <= 0) {
      return [items[0].id, false];
    }

    var smallesIdNeed = needItems[needItems.length - 1];
    var smallestId = items[items.length - 1];
    var more = false;
    if (smallesIdNeed.id === smallestId.id) {
      more = true;
    }
    var largestId = needItems[0].id;
    needItems.map(repostTrap.bind(null, relay))
      .forEach(tube.push.bind(tube));

    return [largestId, more];
  });
}

function updateLid(relay, lid) {
  return new Promise(full => {
    redis.set(getRelayLimit(relay), lid, (error, res) => {
      full(res);
    });
  });
}

function checkPosts(relay, offset, api, tube) {
  return new Promise((full) => {
    var params = {
      count: LIMIT,
      offset: offset,
      v: "5.44"
    };

    if (relay.id) {
      params.owner_id = -relay.id;
    } else if (relay.domain) {
      params.domain = relay.domain;
    } else {
      throw new Error("Unexpected relay format");
    }
    full(params);
  }).then((params) => {
    return api.callMethod('wall.get', params);
  }).then(recievePosts.bind(null, relay, tube))
  .then((result) => {
    var more = result[1];
    var lid = result[0];
    if (more) {
      return pause(MORE_DELAY)
        .then(_ => checkPosts(relay, offset + LIMIT, api, tube))
        .then(updateLid.bind(null, relay, lid));
    } else {
      return updateLid(relay, lid);
    }
  });
}

function createRelay(relay) {
  return checkPosts.bind(null, relay, 0);
}

module.exports = createRelay;
