var express = require('express'),
  app = express(),
  http = require('http').Server(app),
  io = require('socket.io')(http);
var fs = require('fs');
var _ = require('underscore');
var rl = require('readline'),
  cli = rl.createInterface({
    input: process.stdin,
    output: process.stdout
  });
var dj = require('./dj.js');

/* Utility */

// create audio directories if not found
function mkdirSync(path) {
  try {
    fs.mkdirSync(__dirname + path);
  } catch(err) {
    if(err.code != 'EEXIST') {
      throw err;
    }
  }
}
mkdirSync('/media');
mkdirSync('/media/audio');
mkdirSync('/media/temp');

/* Server config */

var port = process.env.PORT || 8080;
app.use('/', express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use(function(req, res) {
  res.sendFile(__dirname + '/public/index.html'); // rerouting middleware
});

/* Socket io */

// current socket connections
var connections = [];

io.on('connection', function(socket) {
  // track unique connection id
  connections.push({ id: socket.id });

  /* Socket utility */

  // chat command parser
  function parseCommand(string) {
    var cmd = string.split(' ', 1);
    if(string.substring(0, 1) == '/') {
      // skip current song in queue
      if(cmd == '/help') {
        socket.emit('command response', '[Commands]   Help: /help | Skip song: /skip');
      }
      if(cmd == '/skip' || cmd == '/next') {
        socket.emit('command response', 'Changing song');
        dj.skipSong(function() {
          io.emit('current song', dj.getSong());
        });
      }
    }
  }

  /* Audio stream to client */

  // request for queue of songs
  socket.on('get queue', function() {
    socket.emit('queue', dj.getQueue());
  });

  // request for current song from client
  socket.on('get current song', function() {
    var audio = dj.getSong();
    if(audio !== null) {
      socket.emit('current song', audio);
      socket.emit('current song info', dj.getSongInfo());
    }
  });

  /* Audio upload from client */

  var files = {};

  socket.on('upload start', function(data) {
    var name = data['name'];
    log('Starting upload:', name);
    files[name] = {
      fileSize: data['size'],
      data: '',
      downloaded: 0
    };
    var place = 0;
    try {
      var stat = fs.statSync(__dirname + '/media/temp/' + name);
      if(stat.isFile()) {
        files[name]['downloaded'] = stat.size;
        place = stat.size / 524288;
      }
    } catch(err) {}
    fs.open(__dirname + '/media/temp/' + name, 'a', 0755, function(err, fd) {
      if(err) {
        log(err);
      }
      else {
        files[name]['handler'] = fd; // store file handler
        socket.emit('request data', { 'place': place, percent: 0 });
      }
    });
  });

  socket.on('upload', function(data) {
    var name = data['name'];
    files[name]['downloaded'] += data['data'].length;
    files[name]['data'] += data['data'];

    // if file is fully uploaded
    if(files[name]['downloaded'] == files[name]['fileSize']) {
      fs.write(files[name]['handler'], files[name]['data'], null, 'binary', function(err, write) {
        var inp = fs.createReadStream(__dirname + '/media/temp/' + name);
        var outp = fs.createWriteStream(__dirname + '/media/audio/' + name);
        inp.pipe(outp, function() {
          fs.unlink(__dirname + '/media/temp/' + name, function () {});
        });
        log('Upload complete:', name);
        socket.emit('upload complete');
        // queue up uploaded song
        dj.queueSong('/media/audio/' + name, io);
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

  /* Chat */

  var numUsers = 0;
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function(data) {
    // log chat message
    log('[' + data.time +'] ' + socket.username + ': ' + data.message);
    // parse message for potential user command
    parseCommand(data.message);
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data.message,
      time: data.time
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function(username) {
    log(username + ' connected');
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

  // when the user disconnects
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

http.listen(port, function() {
  log('listening on *:', port)
});

function log(str, opt = '') {
  console.log('ongaku>', str, opt);
}
