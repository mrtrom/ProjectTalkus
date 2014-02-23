'use strict';

//Filters

angular.module('talkusApp.filters', [])

    .filter('interpolate', ['version', function(version) {
      return function(text) {
        return String(text).replace(/\%VERSION\%/mg, version);
      };
    }])

    .filter('convertAtoE', function(){
      return function(text){
        return String(text).replace('a', 'e');
      };
    });
