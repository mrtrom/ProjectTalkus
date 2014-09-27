'use strict';

/*global Modules:false */

Modules.controllers.controller('MenuController', ['$rootScope', '$scope', 'Session', '$location', '$window',
  function($rootScope, $scope, Session, $location, $window) {

    $scope.LoginMenu = {
      title: 'Join us'
    };

    $scope.LoginValidations = {
      showLogin: true
    };

    $scope.logout = function(){
      Session.delete(function() {
        $location.path('/');
        $window.location.reload();
      });
    };

    Session.get(function(response) {
      if ((response !== null ? response._id : void 0) !== null) {
        if (response._id !== null && response._id !== undefined){
          $scope.LoginMenu.title = 'Sign out';
          $scope.LoginValidations.showLogin = false;
        }
      }
      else{
        $scope.LoginMenu.title = 'Join us';
        $scope.LoginValidations.showLogin = true;
      }
    }, function() {
      $scope.LoginMenu.title = 'Join us';
      $scope.LoginValidations.showLogin = true;
    });

  }]);