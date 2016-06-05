// HomeController.js
// For distribution, all controllers
// are concatanated into single app.js file
// by using Gulp

'use strict';

angular.module('ongaku.home', ['ngRoute'])

// Routing configuration for this module
.config(['$routeProvider',function($routeProvider){
	$routeProvider.when('/', {
		controller: 'HomeController',
		templateUrl: 'app/components/views/home.html'
	});
}])

// Controller definition for this module
.controller('HomeController', ['$scope', function($scope) {

	// Just a housekeeping.
	// In the init method we are declaring all the
	// neccesarry settings and assignments to be run once
	// controller is invoked
	init();

	function init(){

	}

	this.message = "Hello Home!";

}]);
