var fs = require('fs');
var mm = require('musicmetadata');

var method = Dj.prototype;
function Dj() {
  this._time = 0;
  this._queue = [];
}

// queue up song
method.queueSong = function(path, callback) {
  var dj = this;
  var song;
  var filename = path.replace('/audio/', '');

  // load audio data
  fs.readFile(__dirname + path, function(err, data) {
    if(err) {
      throw err;
    }
    // queue raw audio data with filename
    dj._queue.push({
      filename: filename,
      data: data
    });
    song = dj._queue[0]; // reference pushed song to add metadata
    // retrieve metadata
    mm(fs.createReadStream(__dirname + path), { duration: true }, function(err, metadata) {
      if(err) {
        throw err;
      }
      song.title = metadata.title;
      song.artist = metadata.artist;
      song.album = metadata.album;
      song.image = metadata.picture;
      song.length = metadata.duration;

      callback();
    });
  });
};

// get current song array buffer
method.getSong = function() {
  if(this._queue.length <= 0) {
    return null;
  }
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

// skip current song
method.skipSong = function(callback) {
  if(this._queue.length > 0) {
    this._queue.shift();
    callback();
  }
};

// get timestamp of master player
method.getTime = function() {
  return this._time;
};

module.exports = new Dj(); // export singleton
