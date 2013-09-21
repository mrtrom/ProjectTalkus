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
App.config(function($locationProvider, $routeProvider) {
  //$locationProvider.html5Mode(true);
  $routeProvider
    .when('/', {
      templateUrl: '/partials/index', 
      controller: 'LoginController'
    })
    .when('/chat', {
      templateUrl: '/partials/chat', 
      controller:  'AccountController'
    })
    .when('/welcome', {
      templateUrl: '/partials/welcome', 
      controller:  'WelcomeController'
    })
    .otherwise({ redirectTo: '/' });
});