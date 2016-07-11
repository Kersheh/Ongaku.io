'use strict';

angular.module('ongaku.room', [])
.controller('RoomCtrl', ['$scope', function($scope) {
  var socket = io.connect('http://localhost:3000');
}]);
