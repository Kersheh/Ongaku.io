var fs = require('fs');

var method = Dj.prototype;
function Dj() {
  this._time = 0;
  this._queue = [];
}

// queue up song
method.queueSong = function(path, callback) {
  var dj = this;
  fs.readFile(__dirname + path, function(err, data) {
    if(err) {
      console.log('Invalid path or file:', __dirname + path);
    }
    dj._queue.push({
      data: data
    });
    callback();
  });
};

// get current song array buffer
method.getSong = function() {
  if(this._queue.length <= 0) {
    return null;
  }
  console.log(this._queue[0].data);
  return this._queue[0].data;
};

// get current song metadata
method.getSongInfo = function() {
  if(this._queue.length <= 0) {
    return null;
  }
  var song = this._queue[0];
  return {
    title: song.title,
    length: song.length,
    artwork: song.artwork
  };
};

// get timestamp of master player
method.getTime = function() {
  return this._time;
};

module.exports = new Dj(); // export singleton
