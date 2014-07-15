'use strict';

angular.module('talkusApp')

/**
 * Removes server error when user updates input
 */
    .directive('upload', function () {
        return {
            restrict: 'E',
            templateUrl: '/partials/upload',
            controller: 'UploadController'
        };
    });