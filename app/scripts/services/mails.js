'use strict';

/*global Modules:true */

Modules.services.factory('Mails', ['$resource', function($resource) {
  var _url = '/API/mails',
      Mails = $resource(_url);
  return Mails;
}]);