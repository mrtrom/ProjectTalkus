'use strict';

var Modules = {
  controllers: angular.module('myApp.controllers', ['myApp.services'])
};

// Declare app level module which depends on filters, and services
var App = angular.module('myApp', [
    'ngUpload',
    'ngResource',
    'myApp.controllers',
    'myApp.directives',
    'myApp.filters',
    'myApp.services'
]);

App.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {    
    $routeProvider.when('/', {templateUrl: 'partials/index',controller: 'LoginController'});
    $routeProvider.when('/chat/', {templateUrl: 'partials/chat',controller: 'AccountController'});
    $routeProvider.when('/welcome/', {templateUrl: 'partials/welcome',controller: 'WelcomeController'});
    $routeProvider.otherwise({redirectTo: '/404',templateUrl: 'partials/404'});
  }
]);