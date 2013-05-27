Modules.controllers.controller('LoginController', ['$rootScope', '$scope', '$http', '$location', 'Session', function($rootScope, $scope, $http, $location, Session) {

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
    
    //Session
    $scope.session = new Session();
    
    //Login action button
    $scope.submitLogin = function () {
        
        $scope.session.$save(function(res) {
            $rootScope.user = res;
            $scope.permissions.invalidUserInfo = false;
            console.log('response ' + JSON.stringify(res));
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
