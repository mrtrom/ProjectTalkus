'use strict';

/*global Modules:true */
/*exported Modules*/

var Modules = {
  controllers: angular.module('talkusApp.controllers', ['talkusApp.services']),
  services: angular.module('talkusApp.services', []),
  directives: angular.module('talkusApp.directives', []),
  filters: angular.module('talkusApp.filters', [])
};

var App = angular.module('talkusApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'angularFileUpload',
  'ui.bootstrap',
  'talkusApp.controllers',
  'talkusApp.directives',
  'talkusApp.filters',
  'talkusApp.services'
]);

App.config(function ($routeProvider, $locationProvider) {
  $routeProvider
      //.when('/', {templateUrl: '/partials/index', controller: 'LoginController'})
      .when('/', {templateUrl: '/partials/chat', controller:  'ChatController', resolve:{isVideoChat: function() {return false;}}})
      .when('/chat', {templateUrl: '/partials/chat', controller:  'ChatController', resolve:{isVideoChat: function() {return false;}}})
      .when('/video-chat', {templateUrl: '/partials/chat', controller:  'ChatController', resolve:{isVideoChat: function() {return true;}}})
      .otherwise({redirectTo: '/'});
  $locationProvider.html5Mode(true);
});