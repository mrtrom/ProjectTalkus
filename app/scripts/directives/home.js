'use strict';

angular.module('talkusApp')

/**
 * When user wants to sign in or sign up
 */
    .directive('home', function () {
        return {
            restrict: 'E',
            templateUrl: '/partials/index',
            controller: 'LoginController'
        };
    });