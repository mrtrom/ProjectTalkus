Modules.controllers.controller('AccountController', ['$routeParams', '$rootScope', '$scope', '$http', '$location',  'Session', 'User',
    function($routeParams, $rootScope, $scope, $http, $location, Session, User) {
    
    $scope.userInfo = {};
    $scope.userSession = {};
    var userObjectall;
    //get user session
    Session.get(function(response) {
        //succes
        if ((response !== null ? response._id : void 0) !== null) {
            if (response._id !== null){
                $scope.username = response.username;
                $scope.email = response.email;
                console.log(response._id);
                userObjectall = response;
            }
        }
    }, function(response) {
        //error
    });
    
    //get user info
    User.get({username: $routeParams.username},
    function(response) {
        //succes
        $scope.user = response;
    }, function(response) {
        //error
    });
    
    
    $scope.updateusers = function () {
        console.log('username: ' + $scope.username);
        var userEmail = $scope.session.email;
        // Send UPDATE request to the back end.
        User.update(userObjectall,
        function (data) {
            userEmail = data;
        }, function ($http) {
            // Something went wrong and we should inspect $http to find out what.
            console.log('Couldn\'t save user.');
        });
    }
}]);
