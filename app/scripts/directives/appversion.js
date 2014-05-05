'use strict';

/*global Modules:true */

Modules.services.directive('appVersion', ['version', function(version) {
  return function(scope, elm) {
    elm.text(version);
  };
}]);