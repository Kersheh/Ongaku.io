var fs = require('fs');
var mm = require('musicmetadata');

var method = Dj.prototype;
function Dj() {
  this._queue = [];
  this._playing = false;
}

// utility -- convert seconds to hh:mm:ss string
var formatSeconds = function(seconds) {
  var h = Math.floor(seconds / 3600);
  var m = Math.floor((seconds - (h * 3600)) / 60);
  var s = seconds - (h * 3600) - (m * 60);
  s = Math.round(s * 100) / 100;
  var result = (h < 10 ? '0' + h : h);
  result += ':' + (m < 10 ? '0' + m : m);
  result += ':' + (s  < 10 ? '0' + s : s);
  return result;
}

// song timer
method.startTimer = function() {
  var dj = this;
  var song = this._queue[0];
  setInterval(function() {
    song.time_remain = song.time_remain - 1;
    if(song.time_remain <= 0) {
      clearInterval(this);
      dj.nextSong();
    }
  }, 1000);
};

// play song
method.playSong = function() {
  this._playing = true;
  if(this._queue.length > 0) {
    // console.log(this._queue[0].artist);
    console.log('Playing', this._queue[0].artist, '-', this._queue[0].title, '[' + formatSeconds(this._queue[0].time_length) + ']');
    this.startTimer();
  }
};

// queue up song
method.queueSong = function(path) {
  var dj = this;
  var song;
  var filename = path.replace('/media/audio/', '');

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
    song = dj._queue[dj._queue.length - 1]; // reference pushed song to add metadata
    // retrieve metadata
    mm(fs.createReadStream(__dirname + path), { duration: true }, function(err, metadata) {
      if(err) {
        throw err;
      }
      song.title = metadata.title ? metadata.title : 'untitled';
      song.artist = metadata.artist[0] ? metadata.artist[0] : 'unknown artist';
      song.album = metadata.album ? metadata.album : 'unknown album';
      song.artwork = metadata.picture ? metadata.picture : null;
      song.time_length = metadata.duration;
      song.time_remain = metadata.duration;

      if(!dj._playing) {
        dj.playSong();
      }
    });
  });
};

// get song queue
method.getQueue = function() {
  return this._queue;
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
    artist: song.artist,
    album: song.album,
    artwork: song.artwork,
    length: song.time_length,
    remain: song.time_remain
  };
};

// plays next song
method.nextSong = function() {
  if(this._queue.length >= 0) {
    this._queue.shift();
    if(this._queue.length > 0) {
      this.playSong();
    }
    else {
      this._playing = false;
    }
  }
};

module.exports = new Dj(); // export singleton
