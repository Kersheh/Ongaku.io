var ongaku = angular.module('ongaku', [
  'ngRoute',
  'ongaku.home',
  'ongaku.login',
  'ongaku.room',
  'ongaku.services',
  'ongaku.directives',
  'ongaku.filters'
]);

ongaku.config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {
  $routeProvider.when('/', {
    title: 'Home',
    templateUrl: 'components/views/home.html',
    controller : 'HomeCtrl',
  })
  .when('/login', {
    title: 'Login',
    templateUrl: 'components/views/login.html',
    controller: 'LoginCtrl',
  })
  .when('/room', {
    title: 'Room',
    templateUrl: 'components/views/room.html',
    controller: 'RoomCtrl',
  }).otherwise({ redirectTo: '/'});

	// settings for http communications
	$httpProvider.defaults.useXDomain = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];

  // disabling # in Angular urls
  $locationProvider.html5Mode(true);
}])
.run(['$rootScope', '$timeout', function($rootScope, $timeout) {
  var init = true;
  if(typeof io !== 'undefined') {
    $rootScope.socket = io.connect();
  }

  $rootScope.audio_queue = [];

  // $rootScope.audio = null;
  // $rootScope.audio_info = {
  //   title: '',
  //   artist: '',
  //   album: '',
  //   artwork: null,
  //   length: 0,
  //   remain: 0
  // };
  // $rootScope.$watch('audio', function() {
  //   if(init) {
  //     $timeout(function() { init = false; });
  //   }
  //   else {
  //     $('audio').attr('src', $rootScope.audio);
  //     $('audio').trigger('load');
  //     $('audio').oncanplay = function() {
  //       $(this)[0].currentTime = $rootScope.audio_info.length - $rootScope.audio_info.remain;
  //     };
  //     $('audio').trigger('play');
  //   }
  // }, true);

  // $('audio').bind('canplay', function() {
  //   console.log('test');
  //   $(this)[0].currentTime = $rootScope.audio_info.length - $rootScope.audio_info.remain;
  // });

  // audio.currentSong();
}]);
