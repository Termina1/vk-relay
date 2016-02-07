var vk = require('vk-sdk');
var config = require('./config_b');

vk.setToken(config.token);

var crawler = require('./lib/crawler');

function iterate() {
  setInterval(function() {
    try {
      crawler(config, vk);
    } catch(e) {
      console.log(e);
    }
  }, 15 * 60 * 1000);
}
crawler(config, vk);
iterate();
