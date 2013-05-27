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
    
    /*var sessionUser = ['$rootScope', '$q', 'Session', function($rootScope, $q, Session) {
        var deferred;
        console.log('entró get');
        if ($rootScope.user !== null) {
            return $rootScope.user;
        } else {
            deferred = $q.defer();
            Session.get(function(response) {
                if ((response !== null ? response._id : void 0) !== null) {
                    $rootScope.user = response;
                    return deferred.resolve($rootScope.user);
                } else {
                    return deferred.resolve(null);
                }
            }, function(response) {
                return deferred.resolve(null);
            });
            return deferred.promise;
        }
      }
    ];*/
    
    
    $routeProvider.when('/', {templateUrl: 'partials/index',controller: 'LoginController'});
    $routeProvider.when('/chat', {templateUrl: 'partials/chat',controller: 'ChatesController'});
    $routeProvider.when('/chates', {templateUrl: 'partials/chates',controller: 'LoginController'});
    $routeProvider.when('/account', {templateUrl: 'partials/account',controller: 'LoginController'});
    $routeProvider.otherwise({redirectTo: '/'});
  }
]);