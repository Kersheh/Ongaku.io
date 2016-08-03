var app = require('express')(),
  http = require('http').Server(app),
  io = require('socket.io')(http);
var fs = require('fs');
var _ = require('underscore');
var rl = require('readline'),
  cli = rl.createInterface({
    input: process.stdin,
    output: process.stdout
  });
var Dj = require('./js/dj.js'),
  dj = new Dj();

/* Audio master tracker */


// current socket connections
var connections = [];

io.on('connection', function(socket) {
  // track unique connection id
  connections.push({ id: socket.id });

  /* Audio stream to client */

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
    log('Starting upload');
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
        log(err);
      }
      else {
        files[name]['handler'] = fd; // store file handler
        socket.emit('request data', { 'place': place, percent: 0 });
      }
    });
  });

  socket.on('upload', function(data) {
    log('Uploading...');
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
        console.log('Upload complete');
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

  /* Chat */

  var numUsers = 0;
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function(data) {
    log('[' + data.time +'] ' + socket.username + ': ' + data.message);
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
  process.stdout.write('ongaku> ');
});

/* Command line interface utilities */

function log(str) {
  process.stdout.write('\r\n' + str + '\r\nongaku> ');
}

function cliHelp() {
  console.log('List of commands:');
  console.log('| users [u]');
  console.log('| help  [h]  exit [e]');
}

function cliUsers() {
  if(connections.length) {
    console.log('List of users:');
  }
  for(var key in connections) {
    console.log(connections[key].id);
  }
  console.log('Total connected users:', connections.length);
}

function cliDj() {
  console.log(dj.getTime());
}

/* Command line interface */

const cmds = ['dj', 'd', 'users', 'u', 'help', 'h', 'exit', 'e'];

// var stdin = process.stdin;
// stdin.setRawMode(true);
// stdin.resume();
// stdin.setEncoding('utf8');

// stdin.on('data', function(key) {
//   // var chunk = process.stdin.read();
//   process.stdout.write(key);
//   // if (chunk !== null) {
//   //   process.stdout.write(`data: ${chunk}`);
//   // }
// });

cli.on('line', function(input) {
  if(cmds.indexOf(input) >= 0) {
    if(input[0] == 'd') {
      cliDj();
    }
    if(input[0] == 'u') {
      cliUsers();
    }
    if(input[0] == 'h') {
      cliHelp();
    }
    if(input[0] == 'e') {
      console.log('Good bye');
      process.exit();
    }
  }
  process.stdout.write('ongaku> ');
});
