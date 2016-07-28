angular.module('ongaku.services', [])
.factory('socket', function($rootScope) {
  var socket = io.connect('http://localhost:3000');
  return {
    on: function(event, callback) {
      socket.on(event, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          callback.apply(socket, args);
        });
      });
    },
    emit: function(event, data, callback) {
      socket.emit(event, data, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          if(callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
})
.factory('timestamp', function($rootScope) {
  return {
    time: function() {
      var date = new Date();
      var h = date.getHours();
      var m = '0' + date.getMinutes();
      var s = '0' + date.getSeconds();
      return h + ':' + m.substr(-2) + ':' + s.substr(-2);
    }
  };
})
.factory('url', function($rootScope) {
  return {
    isURL: function(str) {
      var pattern = new RegExp('(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})'); // fragment locater
      if(!pattern.test(str)) {
        return false;
      } else {
        return true;
      }
    }
  };
})
.factory('upload', function($rootScope) {
  var SelectedFile;
  return {
    init: function(button, file, name, error, socket) {
      if(window.File && window.FileReader) {
        // Attach event listener to button
        $(button).on('click', function() {
          console.log('test');
          if($(name).value !== '') {
            FReader = new FileReader();
            Name = $(name).value;
            // var Content = "<span id='NameArea'>Uploading " + SelectedFile.name + " as " + Name + "</span>";
            // Content += '<div id="ProgressContainer"><div id="ProgressBar"></div></div><span id="percent">0%</span>';
            // Content += "<span id='Uploaded'> - <span id='MB'>0</span>/" + Math.round(SelectedFile.size / 1048576) + "MB</span>";
            // document.getElementById('UploadArea').innerHTML = Content;
            FReader.onload = function(event) {
              socket.emit('upload', { 'Name' : Name, Data : event.target.result });
            };
            socket.emit('start', { 'Name' : Name, 'Size' : SelectedFile.size });
          }
          else {
            alert("Please Select A File");
          }
        });
        // Attach event listener to maintain recent uploaded file
        $(file).on('change', function(name, event) {
          SelectedFile = event.target.files[0];
          $(name).value = SelectedFile.name;
        });
      }
      else {
        $(error).innerHTML = 'Browser does not support uploading.';
      }
    }
  };
});
