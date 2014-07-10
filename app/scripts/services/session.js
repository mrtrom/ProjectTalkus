'use strict';

/*global Modules:true */

Modules.services.factory('Session', ['$resource', function($resource) {
  var _url = '/API/sessions',
      Session = $resource(_url, {username: '@username'},
          {update: {method: 'PUT'}});

  return Session;
}]);