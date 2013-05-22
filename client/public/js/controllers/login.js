Modules.controllers.controller('LoginController', ['$scope', '$http', '$location', function($scope, $http, $location) {

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
    
    $scope.succesMesages = {
        creationSucces: false
    };
    
    //Login action button
    $scope.submitLogin = function () {
        $http.post('/API/sessions', $scope.singInForm.user).
        success(function(data, status, headers, config){
            $scope.permissions.invalidUserInfo = false;
        }).
        error(function(data, status, headers, config){
            switch (status) {
                case 403:
                    $scope.permissions.invalidUserInfo = true; //Invalid user or password
            }
        });
    };
    
    //Register action button
    $scope.submitRegister = function () {
        $http.post('/API/users', $scope.registerForm).
        success(function(data, status, headers, config){
            $scope.permissions.invalidUserInfo = false;
            $scope.validations.invalidEmailFormat = false;
            $scope.validations.invalidUsername = false;
            $scope.succesMesages.creationSucces = true;
        }).
        error(function(data, status, headers, config){
            switch (status) {
                case 400:
                    var countErrors = data.errors.length;
                    for (var i = 0; i < countErrors; i++){
                        switch (data.errors[i].path) {
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
