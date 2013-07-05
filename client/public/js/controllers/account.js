Modules.controllers.controller('AccountController', ['$routeParams', '$rootScope', '$scope', '$http', '$location',  'Session', 'User', 'ChatUser',
    function($routeParams, $rootScope, $scope, $http, $location, Session, User, ChatUser) {
    
    $scope.userInformation = {}; //Personal information from session / for update
    $scope.otherUserInfo = {}; //Anonym user info
    
    $scope.validations = {
        anonymUser: true
    };
        
    //get user session
    Session.get(function(response) {
        if ((response !== null ? response._id : void 0) !== null) {
            if (response._id !== null){
                $scope.userInformation = response;
                $scope.validations.anonymUser = false;
            }
            else{
                //información usuario anónimo
            }
        }
    }, function(response) {
        //error
    });
    /*function getUserSession(){
        Session.get(function(response) {
            console.log('entrolavuela');
            if ((response !== null ? response._id : void 0) !== null) {
                if (response._id !== null){
                    $scope.userInformation = response;
                    $scope.validations.anonymUser = false;
                }
                else{
                    //información usuario anónimo
                }
            }
        }, function(response) {
            //error
        });
    }*/
    
    //upload images
    $scope.uploadImage = function(content){
        console.log('entro: ' + content);
    };
    
    //update user info
    $scope.updateUsers = function () {
        User.update($scope.userInformation,
        function (data) {
            console.log('modificó');
        }, function ($http) {
            //error
            console.log("Couldn't save user.");
        });
    };
    
    //get other user info
    $scope.otherUser = function (){
        ChatUser.get({username: $scope.userInformation.username},
        function(response) {
            $scope.otherUserInfo = response;
        }, function(response) {
            //error
        });
    };
}]);
