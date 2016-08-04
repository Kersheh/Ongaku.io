angular.module('ongaku.directives', [])
// audio player
.directive('audioPlayer', ['$rootScope', 'socket', function($rootScope, socket) {
  return {
    restrict: 'A',
    templateUrl: 'components/directives/audio_player.html',
    link: function(scope, element, attrs) {
      // watch for song change


      // incoming audio from server
      // socket.on('audio stream', function(data) {
        // var audioBlob = new Blob([data], {type: 'audio/mpeg'});
        // var url = URL.createObjectURL(audioBlob);
        // $('audio').attr('src', url);
        // $('audio').trigger('load');
        // $('audio').trigger('play');

        // mp3 metadata
        // var jsmediatags = window.jsmediatags;
        // jsmediatags.read(audioBlob, {
        //   onSuccess: function(tag) {
        //     var arrayBufferView = new Uint8Array(tag.tags.picture.data);
        //     var imageBlob = new Blob([arrayBufferView], { type: 'image/jpeg' });
        //     $('#photo').attr('src', URL.createObjectURL(imageBlob));
        //   },
        //   onError: function(error) {
        //     // console.log(error);
        //   }
        // });
      // });
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
