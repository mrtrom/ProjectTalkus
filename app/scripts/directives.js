'use strict';

//Directives

angular.module('talkusApp.directives', [])

    .directive('appVersion', ['version', function(version) {
      return function(scope, elm) {
        elm.text(version);
      };
    }]);
