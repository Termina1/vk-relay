var vk = require('vk-call').vk;
var config = require('./config_b');

var api = new vk({
  token: config.token
});

var crawler = require('./lib/crawler');

function iterate() {
  setInterval(function() {
    try {
      crawler(config, api);
    } catch(e) {
      console.log(e);
    }
  }, 15 * 60 * 1000);
}
crawler(config, api);
iterate();
