var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var exec = require('child_process').exec;
var util = require('util');

var numUsers = 0;

// stream audio client
var audio;
fs.readFile(__dirname + '/audio/test.mp3', function(err, data) {
  if(err) {
    throw err;
  }
  // console.log(data);
  audio = data;
});

// save audio locally to server
function saveAudio(audio) {
  console.log(audio);
  fs.writeFile("/audio/test.mp3", audio, function(err) {
    if(err) {
      return console.log(err);
    }
  });
}

io.on('connection', function(socket) {
  /* Test */
  var Files = {};
  socket.on('start', function (data) { //data contains the variables that we passed through in the html file
    console.log('starting');
    var Name = data['Name'];
    Files[Name] = {  //Create a new Entry in The Files Variable
      FileSize : data['Size'],
      Data     : "",
      Downloaded : 0
    }
    var Place = 0;
    try {
      var Stat = fs.statSync('Temp/' +  Name);
      if(Stat.isFile())
      {
        Files[Name]['Downloaded'] = Stat.size;
        Place = Stat.size / 524288;
      }
    }
    catch(er) {} //It's a New File
    fs.open("Temp/" + Name, "a", 0755, function(err, fd){
      if(err) {
        console.log(err);
      }
      else {
        Files[Name]['Handler'] = fd; //We store the file handler so we can write to it later
        socket.emit('MoreData', { 'Place' : Place, Percent : 0 });
      }
    });
  });

  socket.on('upload', function (data) {
    console.log('Uploading...');
    var Name = data['Name'];
    Files[Name]['Downloaded'] += data['Data'].length;
    Files[Name]['Data'] += data['Data'];
    if(Files[Name]['Downloaded'] == Files[Name]['FileSize']) { //If File is Fully Uploaded
      fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function(err, Writen){
        //Get Thumbnail Here
      });
    }
    else if(Files[Name]['Data'].length > 10485760) { //If the Data Buffer reaches 10MB
      fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function(err, Writen){
        Files[Name]['Data'] = ""; //Reset The Buffer
        var Place = Files[Name]['Downloaded'] / 524288;
        var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
        socket.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent});
      });
    }
    else {
      var Place = Files[Name]['Downloaded'] / 524288;
      var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
      socket.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent});
    }
  });

  /* Audio */

  // io.emit('audio stream', audio);

  /* Chat */

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
    if (addedUser) {
      numUsers--;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});

// Server

http.listen(3000, function() {
  console.log('listening on *:3000');
});
