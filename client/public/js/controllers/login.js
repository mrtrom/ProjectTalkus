Modules.controllers.controller('LoginController', ['$scope', '$http', '$location', 'User', function($scope, $http, $location, User) {
    
    //Objet
    $scope.user = {};
    
    //Validations
    $scope.invalidUserInfo = false;
    $scope.permissions = {
        invalidUserInfo: false
    };
    
    //Login action button
    return $scope.submitLogin = function () {
        $http.post('/API/sessions', $scope.user).
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
  }
]);
