'use strict';

//Modules var and resources route
var Modules = {
  controllers: angular.module('myApp.controllers', ['myApp.resources'])
};

// Declare app level module which depends on filters, controllers, directives, and resources
var App = angular.module('myApp', [
    'ngUpload',
    'ngResource',
    'myApp.controllers',
    'myApp.directives',
    'myApp.filters',
    'myApp.resources'
]);

App.config(function($locationProvider, $routeProvider) {
  $routeProvider
    .when('/', {templateUrl: '/partials/index', controller: 'LoginController'})
    .when('/chat', {templateUrl: '/partials/chat', controller:  'AccountController'})
    .otherwise({ redirectTo: '/' });
});