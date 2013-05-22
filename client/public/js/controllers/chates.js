Modules.controllers.controller('ChatesController', ['$scope', '$http', '$location', function($scope, $http, $location) {
    $scope.permissions = {
        invalidUserInfo: false
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
    
}]);
