'use strict';

angular.module('talkusApp')
    .factory('upload', function ($resource) {
        return $resource('/API/upload/photo', {

        });
    })