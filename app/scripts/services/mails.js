'use strict';

/*global Modules:true */

Modules.services.factory('Mails', ['$resource', function($resource) {
  var _url = '/API/mails/:id ',
      Mails = $resource(_url,null,{update:{method:'PUT'}});
  return Mails;
}]);