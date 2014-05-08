'use strict';

angular.module('talkusApp')
    .factory('upload', function ($resource) {
        return $resource('/API/upload/photo', {

        });
    })
    .factory('uploadget', function ($resource) {
        return $resource('/API/upload/get', {

        });
    });