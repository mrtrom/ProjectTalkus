'use strict';

//Resources

angular.module('myApp.services', [])

.factory('Session', ['$resource', function($resource) {
    var _url = '/API/sessions',
        Session = $resource(_url);
        
    return Session;
  }
])

.factory('User', ['$resource', function($resource) {
    var _url = '/API/users',
        User = $resource(_url);
        
    return User;
  }
]);