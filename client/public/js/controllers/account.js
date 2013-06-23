Modules.controllers.controller('AccountController', ['$routeParams', '$rootScope', '$scope', '$http', '$location',  'Session', 'User',
    function($routeParams, $rootScope, $scope, $http, $location, Session, User) {
    
    $scope.userInfo = {};
    $scope.userSession = {};
    
    //get user session
    Session.get(function(response) {
        //succes
        if ((response !== null ? response._id : void 0) !== null) {
            if (response._id !== null){
                
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
    
}]);
