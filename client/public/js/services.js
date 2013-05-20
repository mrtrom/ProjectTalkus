'use strict';

//Resources

angular.module('myApp.services', [])

.factory('User', ['$resource', function($resource) {
    var User, _postsUrl, _url;
    _url = '/API/users/:username';
    _postsUrl = '/API/users/:id/posts';
    User = $resource(_url, {}, {
      update: {
        method: 'PUT'
      }
    });
    return User;
  }
]);