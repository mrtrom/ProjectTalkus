'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {templateUrl: 'partials/index',controller: LoginCtrl});
    $routeProvider.when('/chat', {templateUrl: 'partials/chat',controller: DetailCtrl});
    $routeProvider.when('/account', {templateUrl: 'partials/account',controller: DetailCtrl});
    $routeProvider.otherwise({redirectTo: '/'});
    $locationProvider.html5Mode(false);
  }]);