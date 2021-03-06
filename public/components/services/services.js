angular.module('ongaku.services', [])
// pseudo socket class for angular
.factory('socket', function($rootScope) {
  return {
    // socket on
    on: function(event, callback) {
      $rootScope.socket.on(event, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          callback.apply($rootScope.socket, args);
        });
      });
    },
    // socket emit
    emit: function(event, data, callback) {
      $rootScope.socket.emit(event, data, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          if(callback) {
            callback.apply($rootScope.socket, args);
          }
        });
      });
    }
  };
})
.factory('timestamp', function($rootScope) {
  return {
    // get current time as formatted string
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
    // check if string is url
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
.factory('timer', function($rootScope, $interval) {
  return {
    // countdown timer with callback
    start: function(remain, callback) {
      var timer = $interval(function() {
        // console.log(remain);
        remain = remain - 1;
        if(remain <= 0) {
          $interval.cancel(timer);
          callback();
        }
      }, 1000);
    }
  };
});
