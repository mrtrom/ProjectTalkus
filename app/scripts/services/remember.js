'use strict';

/*global Modules:true */

Modules.services.factory('Remember', ['$resource', function($resource) {
  var _url = '/API/remember',
      Remember = $resource(_url);
  return Remember;
}]);