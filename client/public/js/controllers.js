'use strict';

/* Controllers */

//Index controllers
function IndexCtrl($scope, $http) {
  $http.get('/API/posts').
    success(function(data, status, headers, config) {
      $scope.posts = data.posts;
    });
}

//Sessions controllers
function LoginCtrl($scope, $http, $location) {
    $scope.user = {};
    $scope.invalidUserInfo = false;
    $scope.submitLogin = function () {
                
        $http.post('/API/sessions', $scope.user).
        success(function(data, status, headers, config){
            console.log('inicio');
            $scope.invalidUserInfo = false;
        }).
        error(function(data, status, headers, config){
            switch (status) {
                case 403:
                    $scope.invalidUserInfo = true;
            }
        });
    };
    
}