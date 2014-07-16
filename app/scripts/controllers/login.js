'use strict';

/*global Modules:false */
/*global PNotify:false*/

Modules.controllers.controller('LoginController', ['$rootScope', '$scope', '$http', '$window', '$location','$modal', 'Session', 'Mails', 'Remember', 'User', 'Valid',
  function($rootScope, $scope, $http, $window, $location, $modal, Session, Mails, Remember, User, Valid) {

    //Checks if any string was send via url
    if(($location.search()).idValid !== undefined && ($location.search()).idValid !== null && ($location.search()).idValid !== ''){
      $scope.Valid = new Valid();
      $scope.Valid.idValid = $location.search().idValid;

      //Update to valid
      $scope.Valid.$save(function(res) {
            $rootScope.user = res;
            $scope.permissions.invalidUserInfo = false;
            new PNotify({
              title: 'Nice!',
              text: 'You are now verified, login in order to acces to your account <a href data-toggle="modal" data-target="#modMain" ><span>Sign in/up</span></a>',
              remove: true
            });
          },
          function(){
            //Error
          }
      );
    }

    //Validations
    $scope.permissions = {
      invalidUserInfo: false
    };

    $scope.validations = {
      duplicatedEmail: false,
      duplicatedUser: false,
      invalidEmailFormat: false,
      invalidUsername: false
    };

    $scope.loginValidations = {
      userSessionExist: false
    };
    $scope.password = {
      remember: false,
      remembererror: false
    };

    //Session
    $scope.session = new Session();
    //User
    $scope.userObject = new User();
    //Mail
    $scope.Mails = new Mails();
    //Remember password
    $scope.Remember = new Remember();

    //Rememeber password
    $scope.forgotpass = function(){
      $scope.Remember.$save(function() {
            $scope.password.remember = true;
            $scope.password.remembererror = false;
          },
          function(){
            $scope.password.remember = false;
            $scope.password.remembererror = true;
          }
      );
    };

    //Login action button
    $scope.submitLogin = function () {
      $scope.session.$save(function(res) {
            $rootScope.user = res.user;
            $scope.permissions.invalidUserInfo = false;
            $location.path('/');
            $window.location.reload();
          },
          function(res){
            switch (res.status) {
              case 403:
                $scope.permissions.invalidUserInfo = true; //Invalid user or password
            }
          }
      );
    };

    //Register action button
    $scope.submitRegister = function () {
      var locaUser = $scope.userObject.user.username;
      var localPass = $scope.userObject.user.password;

      //Succes
      $scope.userObject.$save(function(res){
            $scope.Mails.user = res.user;
            $scope.Mails.$save(function(){
                  //console.log('exito');
                },
                function() {
                  //console.log('error');
                });

            $scope.permissions.invalidUserInfo = false;
            $scope.validations.invalidEmailFormat = false;
            $scope.validations.invalidUsername = false;
            $scope.session.username = locaUser;
            $scope.session.password = localPass;
            $scope.submitLogin();
          },
          function(res){
            console.log(res);
            switch (res.status) {
              case 500:
                var countErrors = res.data.errors.length;
                for (var i = 0; i < countErrors; i++){
                  switch (res.data.errors[i].path) {
                    case 'username':
                      $scope.validations.invalidUsername = true;
                      $scope.validations.invalidEmailFormat = false;
                      break;
                    case 'email':
                      $scope.validations.invalidEmailFormat = true;
                      $scope.validations.invalidUsername = false;
                      break;
                  }
                }
                break;
            }
          }
      );
    };
  }]);
