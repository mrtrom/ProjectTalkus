Modules.controllers.controller('AccountController', ['$routeParams', '$rootScope', '$scope', '$http', '$location',  'Session', 'User',
    function($routeParams, $rootScope, $scope, $http, $location, Session, User) {
    
    //user session
    var userSession = null;
    
    //user info
    var user = null;
    $scope.user = {};
    //get user session
    Session.get(function(response) {
        //succes session
        if ((response !== null ? response._id : void 0) !== null) {
            if (response._id !== null){
                if (response.username == $routeParams.username){
                    userSession = response;
                    //dejar editar al usuario
                }
            }
        }
    }, function(response) {
        userSession = null;
    });
    
    //get user info
    if (userSession !== null)
    {
        User.get({username: $routeParams.username},
        function(response) {
            //succes session
            user = response;
            $scope.user = response;
            console.log('exito: ' + JSON.stringify($scope.user));
        }, function(response) {
            //error session
            user = null;
        });
    }
    else{
        User.get({username: $routeParams.username},
        function(response) {
            //succes session
            user = response;
            $scope.user = response;
            console.log('exito: ' + JSON.stringify($scope.user));
        }, function(response) {
            //error session
            user = null;
        });
    }
    
}]);
