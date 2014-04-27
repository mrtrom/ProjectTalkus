'use strict';

/*global Modules:true */
/*exported Modules*/

var Modules = {
  controllers: angular.module('talkusApp.controllers', ['talkusApp.resources'])
};

var App = angular.module('talkusApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngUpload',
  'ui.bootstrap',
  'talkusApp.controllers',
  'talkusApp.directives',
  'talkusApp.filters',
  'talkusApp.resources'
]);

App.config(function ($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {templateUrl: '/partials/index', controller: 'LoginController'})
    .when('/chat', {templateUrl: '/partials/chat', controller:  'ChatController'})
    .when('/video-chat', {templateUrl: '/partials/videochat', controller:  'VideoChatController'})
    .otherwise({redirectTo: '/'});
  $locationProvider.html5Mode(true);
});