angular.module('ongaku.directives', [])
.directive('audioPlayer', ['socket', function(socket) {
  return {
    restrict: 'A',
    templateUrl: 'app/components/directives/audio_player.html',
    link: function(scope, element, attrs) {
      // incoming audio from server
      socket.on('audio stream', function(data) {
        var blob = new Blob([data], {type: 'audio/mpeg'});
        var url = URL.createObjectURL(blob);
        $('audio').attr('src', url);
        $('audio').trigger('load');
        $('audio').trigger('play');
      });
    }
  };
}])
.directive('uploadFile', ['$timeout', 'socket', function($timeout, socket) {
  return {
    restrict: 'A',
    templateUrl: 'app/components/directives/upload_file.html',
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
            socket.emit('start', { 'name': name, 'size': file.size });
            // reader.readAsBinaryString(file);
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
      socket.on('moreData', function (data) {
        // updateBar(data['Percent']);
        var place = data['place'] * 524288;
        var newFile;
        newFile = file.slice(place, place + Math.min(524288, (file.size - place)));
        reader.readAsBinaryString(newFile);
      });
    }
  };
}]);
