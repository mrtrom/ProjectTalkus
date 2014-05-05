'use strict';

/*global Modules:true */

Modules.services.factory('User', ['$resource', function($resource) {
  var _url = '/API/users/:username',
      User = $resource(_url, {username: '@username'},
          {update: {method: 'PUT'}});

  return User;
}]);