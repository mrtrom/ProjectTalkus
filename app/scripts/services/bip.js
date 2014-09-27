'use strict';

angular.module('talkusApp')
    .factory('bip', function ($resource) {
        return $resource('/API/bip/:id', {
        });
    });