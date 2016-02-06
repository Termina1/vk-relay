var vk = require('vk-sdk');
var config = require('./config');

vk.setToken(config.token);

var crawler = require('./lib/crawler');

function iterate() {
  setInterval(function() {
    try {
      crawler(config, vk);
    } catch(e) {}
  }, 15 * 60 * 1000);
}
crawler(config, vk);
iterate();
