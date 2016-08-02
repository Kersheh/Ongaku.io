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
});
