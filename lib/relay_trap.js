var through = require('through2');
var pause = require('./utils').pause;

const DELAY_TIME = 10000;

function repost(el, api) {
  return api.callMethod('wall.repost', {
    object: el.id,
    group_id: el.target.peer,
    v: "5.44"
  });
}

function sendMessage(el, api) {
  return api.callMethod('messages.send', {
    peer_id: el.target.peer,
    attachment: el.id,
    v: "5.44"
  });
}

function processTrap(el, api) {
  var task;
  switch(el.type) {
    case "repost":
      task = repost(el, api);
      break;

    case "message":
      task = sendMessage(el, api);
      break;
  }
  return task
    .then(_ => pause(DELAY_TIME))
    .catch(err => console.log(err));
}

function createTrap(api) {
  return through.obj((el, t, cb) => {
    console.log(el.id, "response");
    processTrap(el, api)
      .then(cb.bind(null, null))
      .catch(err => {
        console.log(err);
        return pause(1000).then(cb.bind(null, null));
      });
  });
}

module.exports = createTrap;
