'use strict';

var Modules = {
  controllers: angular.module('myApp.controllers', ['myApp.services'])
};

// Declare app level module which depends on filters, and services
var App = angular.module('myApp', [
    'ngResource',
    'myApp.controllers',
    'myApp.directives',
    'myApp.filters',
    'myApp.services'
]);

App.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {templateUrl: 'partials/index',controller: 'LoginController'});
    $routeProvider.when('/chat', {templateUrl: 'partials/chat',controller: 'LoginController'});
    $routeProvider.when('/chates', {templateUrl: 'partials/chates',controller: 'ChatesController'});
    $routeProvider.when('/account', {templateUrl: 'partials/account',controller: 'LoginController'});
    $routeProvider.otherwise({redirectTo: '/'});
  }
]);