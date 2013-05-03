'use strict';

/* Controllers */

//Sessions controllers
function LoginCtrl($scope, $http, $location) {
    $scope.user = {};
    $scope.invalidUserInfo = false;
    $scope.submitLogin = function () {
                
        $http.post('/API/sessions', $scope.user).
        success(function(data, status, headers, config){
            $scope.invalidUserInfo = false;
        }).
        error(function(data, status, headers, config){
            switch (status) {
                case 403:
                    $scope.invalidUserInfo = true;
            }
        });
    };
    //$location.$$absUrl = $location.$$absUrl.replace('#/', '');
    console.log($location);
    console.log($location.$$absUrl);
    
}

function DetailCtrl($scope, $http, $location) {
    console.log('entró');
    //$location.$$absUrl = $location.$$absUrl.replace('#/', '');
    console.log("asd" + $location);
    console.log($location.$$absUrl);
}