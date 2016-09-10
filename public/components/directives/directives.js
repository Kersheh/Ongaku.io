angular.module('ongaku.directives', [])
// audio player
.directive('audioPlayer', ['$rootScope', 'socket', 'timer', function($rootScope, socket, timer) {
  var playing = false;

  // play audio at top of queue
  var playSong = function() {
    playing = true;
    var audioBlob = new Blob([$rootScope.audio_queue[0].data], { type: 'audio/mpeg' });
    var audioURL = URL.createObjectURL(audioBlob);
    $('audio').attr('src', audioURL);
    $('audio').trigger('load');
    // set audio remaining time
    $('audio')[0].currentTime = $rootScope.audio_queue[0].time_length - $rootScope.audio_queue[0].time_remain;
    $('audio').trigger('play');
    // start client-side timer
    timer.start($rootScope.audio_queue[0].time_remain, nextSong);
  };

  // play next song
  var nextSong = function() {
    $rootScope.audio_queue.shift();
    if($rootScope.audio_queue.length > 0) {
      playSong();
    }
    else {
      playing = false;
    }
  };

  return {
    restrict: 'A',
    templateUrl: 'components/directives/audio_player.html',
    link: function(scope, element, attrs) {
      // retrieve server queue on load
      if($rootScope.socket) {
        socket.emit('get queue');
        // load queue from server
        socket.on('queue', function(data) {
          $rootScope.audio_queue = data;
          console.log($rootScope.audio_queue);
          if($rootScope.audio_queue.length > 0) {
            playSong();
          }
        });
        // update queue from server
        socket.on('update queue', function(data) {
          $rootScope.audio_queue.push(data);
          if(!playing) {
            playSong();
          }
        });
      }
    }
  };
}])
.directive('uploadFile', ['$timeout', 'socket', function($timeout, socket) {
  return {
    restrict: 'A',
    templateUrl: 'components/directives/upload_file.html',
    link: function(scope, element, attrs) {
      // upload listeners
      var reader, file, name;
      if(window.File && window.FileReader) {
        $timeout(function() {
          // attach event listener to button
          $('#uploadButton').on('click', function() {
            reader = new FileReader();
            reader.onload = function(event) {
              socket.emit('upload', { 'name': name, data: event.target.result });
            };
            socket.emit('upload start', { 'name': name, 'size': file.size });
          });
          // attach event listener to filebox
          $('#fileBox').change(function() {
            file = document.getElementById('fileBox').files[0];
            name = file.name;
          });
        }, 1);
      }
      else {
        $timeout(function() {
          $('#upload').html('Browser does not support uploading.');
        }, 1);
      }

      // client response on server request to continue upload
      socket.on('request data', function(data) {
        updateBar(data.percent);
        var place = data.place * 524288;
        var newFile;
        newFile = file.slice(place, place + Math.min(524288, (file.size - place)));
        reader.readAsBinaryString(newFile);
      });

      // update progress bar
      function updateBar(percent) {
        // document.getElementById('progressBar').style.width = percent + '%';
        $('#percentUpload').html((Math.round(percent * 100) / 100) + '%');
        // var progress = Math.round(((percent / 100.0) * file.size) / 1048576);
        // document.getElementById('MB').innerHTML = progress;
      }

      // upload complete
      socket.on('upload complete', function() {
        // document.getElementById('progressBar').style.width = '100%';
        $('#percentUpload').html('100%');
        // var Content = "<img id='Thumb' src='" + Path + data['Image'] + "' alt='" + Name + "'><br>";
        // Content += "<button  type='button' name='Upload' value='' id='Restart' class='Button'>Upload Another</button>";
        // document.getElementById('UploadArea').innerHTML = Content;
        // document.getElementById('Restart').addEventListener('click', Refresh);
      });
    }
  };
}]);
