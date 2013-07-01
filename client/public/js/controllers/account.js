Modules.controllers.controller('AccountController', ['$routeParams', '$rootScope', '$scope', '$http', '$location',  'Session', 'User',
    function($routeParams, $rootScope, $scope, $http, $location, Session, User) {
    
    $scope.userInformation = {};
    
    $scope.userInfo = {};
    $scope.userSession = {};
    //get user session
    
    
    Session.get(function(response) {
        if ((response !== null ? response._id : void 0) !== null) {
            if (response._id !== null){
                $scope.userInformation = response;
            }
        }
    }, function(response) {
        //error
    });
    
    //get user info
    /*User.get({username: $routeParams.username},
    function(response) {
        //succes
        $scope.user = response;
    }, function(response) {
        //error
    });*/
    
    
    $scope.updateusers = function () {
        User.update($scope.userInformation,
        function (data) {
            console.log('modificó');
        }, function ($http) {
            console.log("Couldn't save user.");
        });
    };
}]);
