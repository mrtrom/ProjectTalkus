'use strict';

/*global $:false */
/*global Modules:false */

Modules.controllers.controller('LoginController', ['$rootScope', '$scope', '$http', '$location','$modal', 'Session','Mails','Remember', 'User', 'Valid',
  function($rootScope, $scope, $http, $location,$modal, Session, Mails ,Remember, User, Valid) {

    //Checks if any string was send via url
    if(($location.search()).idValid !== undefined && ($location.search()).idValid !== null && ($location.search()).idValid !== ''){
      $scope.Valid = new Valid();
      $scope.Valid.idValid = $location.search().idValid;

      //Update to valid
      $scope.Valid.$save(function(res) {
            $rootScope.user = res;
            $scope.permissions.invalidUserInfo = false;
            $location.path('/chat');
          },
          function(res){
            //Error
          });
    }
    $scope.open = function () {

      var modalInstance = $modal.open({
        templateUrl: 'myModalContent.html',
        controller: ModalInstanceCtrl
      });
    };
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

    $scope.succesMesages = {
      creationSucces: false
    };

    //Session
    $scope.session = new Session();
    //User
    $scope.userObject = new User();
    //Mail
    $scope.Mails = new Mails();
    //Remember password
    $scope.Remember = new Remember();


    //Redireccion si ya está logueado
    Session.get(function(response) {
      if ((response !== null ? response._id : void 0) !== null) {
        if (response._id !== null && response._id !== undefined){
          $scope.loginValidations.userSessionExist = true;
          //$location.path('/welcome');
        }
      }
    }, function(response) {
      //error
    });
    $scope.forgotpass = function(){
      $scope.Remember.$save(function(res) {
            $scope.password.remember = true;
            $scope.password.remembererror = false;
          },
          function(res){
            $scope.password.remember = false;
            $scope.password.remembererror = true;
          });
    };

    //Login action button
    $scope.submitLogin = function () {
      $scope.session.$save(function(res) {
            $rootScope.user = res.user;
            $scope.permissions.invalidUserInfo = false;
            $location.path('/chat');
          },
          function(res){
            switch (res.status) {
              case 403:
                $scope.permissions.invalidUserInfo = true; //Invalid user or password
            }
          });
    };

    //Register action button
    $scope.submitRegister = function () {
      var locaUser = $scope.userObject.user.username;
      var localPass = $scope.userObject.user.password;

      $scope.userObject.$save(function(res){
            $scope.Mails.user = res.user;
            $scope.Mails.$save(function(resMails){
                  console.log('exito');
                },
                function(error) {
                  console.log('error');
                });

            $scope.permissions.invalidUserInfo = false;
            $scope.validations.invalidEmailFormat = false;
            $scope.validations.invalidUsername = false;
            $scope.succesMesages.creationSucces = true;
            $scope.session.username = locaUser;
            $scope.session.password = localPass;
            $scope.submitLogin();
          },
          function(res){
            switch (res.status) {
              case 400:
                var countErrors = res.data.errors.length;
                for (var i = 0; i < countErrors; i++){
                  switch (res.data.errors[i].path) {
                    case 'email':
                      $scope.validations.invalidEmailFormat = true;
                      break;
                    case 'username':
                      $scope.validations.invalidUsername = true;
                      break;
                  }
                }
                break;
            }
          });

    };


  }]);
