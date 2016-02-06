exports.pause = function(time) {
  return new Promise(full => {
    setTimeout(full, time);
  });
}
