'use strict';

var ongaku = angular.module('ongaku', [
  'ngRoute',
  'ongaku.home',
  'ongaku.about',
  'ongaku.login'
]);

ongaku.config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {

  $routeProvider.otherwise({ redirectTo: '/'});

	// settings for http communications
	$httpProvider.defaults.useXDomain = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];

  // disabling # in Angular urls
  $locationProvider.html5Mode(true);
}]);
