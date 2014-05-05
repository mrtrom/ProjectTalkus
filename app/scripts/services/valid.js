'use strict';

/*global Modules:true */

Modules.services.factory('Valid', ['$resource', function($resource) {
  var _url = '/API/valid',
      Valid = $resource(_url);
  return Valid;
}]);