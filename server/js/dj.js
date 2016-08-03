var fs = require('fs');

var method = Dj.prototype;
function Dj() {
  this._time = 0;
  this._queue = [];
}

// queue up song
method.queueSong = function(path) {
  var dj = this;
  fs.readFile(__dirname + path, function(err, data) {
    if(err) {
      console.log('Invalid path or file:', __dirname + path);
    }
    dj._queue.push({ data: data });
  });
};

// get current song
method.getSong = function() {
  if(this._queue.length <= 0) {
    return null;
  }
  return this._queue[0];
};

// get timestamp of current song
method.getTime = function() {
  return this._time;
};

module.exports = new Dj(); // export singleton
