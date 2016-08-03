var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var _ = require('underscore');

// stream audio client
function currentSong() {

}
var test = currentSong();

// save audio locally to server
function saveAudio(audio) {
  console.log(audio);
  fs.writeFile('/audio/test.mp3', audio, function(err) {
    if(err) {
      return console.log(err);
    }
    else {
      console.log('Saved file.')
    }
  });
}

var connections = [];

io.on('connection', function(socket) {
  // track unique connection id
  connections.push({ id: socket.id });

  // request for current song from client
  socket.on('get current song', function() {
    // move to master audio tracker
    fs.readFile(__dirname + '/audio/test.mp3', function(err, data) {
      if(err) {
        throw err;
      }
      socket.emit('current song', data);
    });
  });



  /* Audio upload from client */

  var files = {};

  socket.on('upload start', function(data) {
    console.log('Starting upload');
    var name = data['name'];
    files[name] = {
      fileSize: data['size'],
      data: '',
      downloaded: 0
    }
    var place = 0;
    try {
      var stat = fs.statSync(__dirname + '/temp/' + name);
      if(stat.isFile()) {
        files[name]['downloaded'] = stat.size;
        place = stat.size / 524288;
      }
    }
    catch(err) {}
    fs.open(__dirname + '/temp/' + name, 'a', 0755, function(err, fd) {
      if(err) {
        console.log(err);
      }
      else {
        files[name]['handler'] = fd; // store file handler
        socket.emit('request data', { 'place': place, percent: 0 });
      }
    });
  });

  socket.on('upload', function(data) {
    console.log('Uploading...');
    var name = data['name'];
    files[name]['downloaded'] += data['data'].length;
    files[name]['data'] += data['data'];

    // if file is fully uploaded
    if(files[name]['downloaded'] == files[name]['fileSize']) {
      fs.write(files[name]['handler'], files[name]['data'], null, 'binary', function(err, write) {
        var inp = fs.createReadStream(__dirname + '/temp/' + name);
        var outp = fs.createWriteStream(__dirname + '/audio/' + name);
        inp.pipe(outp, function() {
          fs.unlink(__dirname + '/temp/' + name, function () {});
        });
        socket.emit('done');
      });
    }
    // if the data buffer reaches 10MB
    else if(files[name]['data'].length > 10485760) {
      fs.write(files[name]['handler'], files[name]['data'], null, 'binary', function(err, write) {
        files[name]['data'] = ''; // reset buffer
        var place = files[name]['downloaded'] / 524288;
        var percent = (files[name]['downloaded'] / files[name]['fileSize']) * 100;
        socket.emit('request data', { 'place': place, 'percent': percent });
      });
    }
    else {
      var place = files[name]['downloaded'] / 524288;
      var percent = (files[name]['downloaded'] / files[name]['fileSize']) * 100;
      socket.emit('request data', { 'place': place, 'percent': percent });
    }
  });

  /* Audio stream to client */

  // io.emit('audio stream', audio);

  /* Chat */

  var numUsers = 0;
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function(data) {
    console.log('[' + data.time +'] ' + socket.username + ': ' + data.message);
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data.message,
      time: data.time
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function(username) {
    console.log(username + ' connected');
    if(addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    numUsers++;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function() {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function() {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function() {
    // remove disconnected id
    connections = _.reject(connections, function(obj) { return obj.id == socket.id; });
    if(addedUser) {
      numUsers--;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });

});

/* Server */

http.listen(3000, function() {
  console.log('listening on *:3000');
});
