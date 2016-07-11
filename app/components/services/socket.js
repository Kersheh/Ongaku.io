// 'use strict';

angular.module('ongaku.socket', [])
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
});
