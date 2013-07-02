Modules.controllers.controller('AccountController', ['$routeParams', '$rootScope', '$scope', '$http', '$location',  'Session', 'User','ChatUser',
    function($routeParams, $rootScope, $scope, $http, $location, Session, User, ChatUser) {
    
    $scope.userInformation = {}; //Personal information from session / for update
    $scope.otherUserInfo = {}; //Anonym user info
        
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
    
    $scope.updateusers = function () {
        User.update($scope.userInformation,
        function (data) {
            console.log('modificó');
        }, function ($http) {
            console.log("Couldn't save user.");
        });
    };
    
    
    $scope.changeName = function (){
        ChatUser.get({username: $scope.userInformation.username},
        function(response) {
            $scope.otherUserInfo = response;
        }, function(response) {
            //error
        });
    };
}]);
