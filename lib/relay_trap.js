var through = require('through2');
var pause = require('./utils').pause;

function repost(el, api) {
  return api.callMethod('wall.repost', {
    object: el.id,
    group_id: el.target.id
  });
}



function processTrap(el, api) {
  var task;
  switch(el.type) {
    case "repost":
      task = repost(el, api);
      break;
  }
  return task
    .catch(a => console.log(a))
    .then(_ => pause(1500));
}

function createTrap(api) {
  return through.obj((el, t, cb) => {
    processTrap(el, api).then(cb.bind(null, null));
  });
}

module.exports = createTrap;
