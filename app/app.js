var ongaku = angular.module('ongaku', [
  'ngRoute',
  'ongaku.home',
  'ongaku.login',
  'ongaku.room',
  'ongaku.services',
  'ongaku.directives'
]);

ongaku.config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {
  $routeProvider.when('/', {
    title: 'Home',
    templateUrl: 'app/components/views/home.html',
    controller : 'HomeCtrl',
  })
  .when('/login', {
    title: 'Login',
    templateUrl: 'app/components/views/login.html',
    controller: 'LoginCtrl',
  })
  .when('/room', {
    title: 'Room',
    templateUrl: 'app/components/views/room.html',
    controller: 'RoomCtrl',
  }).otherwise({ redirectTo: '/'});

	// settings for http communications
	$httpProvider.defaults.useXDomain = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];

  // disabling # in Angular urls
  // $locationProvider.html5Mode(true);
}])
.run(['$rootScope', '$timeout', 'audio', function($rootScope, $timeout, audio) {
  var init = true;
  if(typeof io !== 'undefined') {
    $rootScope.socket = io.connect('http://localhost:3000');
  }

  $rootScope.song = null;
  $rootScope.$watch('song', function() {
    if(init) {
      $timeout(function() { init = false; });
    }
    else {
      $('audio').attr('src', $rootScope.song);
      $('audio').trigger('load');
      $('audio').trigger('play');
    }
  }, true);

  audio.currentSong();
}]);
