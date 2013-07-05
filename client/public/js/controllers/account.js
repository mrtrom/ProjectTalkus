Modules.controllers.controller('AccountController', ['$routeParams', '$rootScope', '$scope', '$http', '$location',  'Session', 'User', 'ChatUser',
    function($routeParams, $rootScope, $scope, $http, $location, Session, User, ChatUser) {
    
    $scope.userInformation = {}; //Personal information from session / for update
    $scope.otherUserInfo = {}; //Anonym user info
    
    $scope.validations = {
        anonymUser: true,
        anonymOtherUser: true
    };
    
    $scope.userInformation = {
        username: '',
        email: '',
        name: '',
        gender: '',
        avatar: '',
        description: '',
        location: '',
        birth: ''
    };
    var googleBool = false;
    //get user session
    $scope.loadInfo = function () {
        Session.get(function(response) {
            if ((response !== null ? response._id : void 0) !== null) {
                if (response._id !== null && response._id !== undefined){
                    $scope.userInformation = response;
                    $scope.validations.anonymUser = false;
                }
            }
            
            //validacion de información
            if ($scope.userInformation.username === undefined || $scope.userInformation.username === ''){
                ChatUser.getUsername({username: 'get'},
                function(response) {
                    $scope.userInformation.username = 'anonym' + response.count;
                }, function(response) {
                    //error
                });
            }
            
            console.log('$location: ' + JSON.stringify($location.$$host));
            
            if ($scope.userInformation.email === undefined || $scope.userInformation.email === ''){$scope.userInformation.email = "";}
            if ($scope.userInformation.name === undefined || $scope.userInformation.name === ''){$scope.userInformation.name = $scope.userInformation.username;}
            if ($scope.userInformation.gender === undefined || $scope.userInformation.gender === ''){$scope.userInformation.gender = "";}
            if ($scope.userInformation.avatar === undefined || $scope.userInformation.avatar === ''){$scope.userInformation.avatar = "uploads/images/avatars/default.jpg";}
            if ($scope.userInformation.description === undefined || $scope.userInformation.description === ''){$scope.userInformation.description = "";}
            if ($scope.userInformation.location === undefined || $scope.userInformation.location === ''){$scope.userInformation.location = "";}
            if ($scope.userInformation.birth === undefined || $scope.userInformation.birth === ''){$scope.userInformation.birth = "";}
            
        }, function(response) {
            //error
        });
    };
    
    //upload images
    $scope.uploadImage = function(content){
        console.log('entro: ' + content);
    };
    //datePicker
    $(function() {
        $( "#datepicker" ).datepicker({
           onSelect: function(dateText, inst) { 
               $scope.userInformation.birth = dateText;
               $('.updateUser').click();
           },
          changeMonth: true,
          changeYear: true,
          yearRange: "-80:+0",
          dateFormat: 'dd/mm/yy'
        });
      });
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
    $scope.locationBool = function () {
        getLocation();
        if(googleBool == false){
            googleBool = true;
            $scope.userInformation.location = document.getElementById('locationapi').value;
            $("#locationapi").prop('disabled', false);
        }else{
            $scope.userInformation.location = '';
            googleBool = false;
            $("#locationapi").prop('disabled', true);
        }
    };
    //get other user info
    $scope.otherUser = function (){
        if($scope.userInformation.username !== undefined && $scope.userInformation.username !== ''){
            ChatUser.get({username: $scope.userInformation.username},
            function(response) {
                $scope.validations.anonymOtherUser = false;
                $scope.otherUserInfo = response;
                console.log('response: ' + JSON.stringify(response));
            }, function(response) {
                switch (response.status) {
                case 404:
                    $scope.otherUserInfo.username = response.data;
                    break;
                }
            });
            
            if ($scope.otherUserInfo.email === undefined || $scope.otherUserInfo.email === ''){$scope.otherUserInfo.email = "";}
            if ($scope.otherUserInfo.name === undefined || $scope.otherUserInfo.name === ''){$scope.otherUserInfo.name = $scope.otherUserInfo.username;}
            if ($scope.otherUserInfo.gender === undefined || $scope.otherUserInfo.gender === ''){$scope.otherUserInfo.gender = "";}
            if ($scope.otherUserInfo.avatar === undefined || $scope.otherUserInfo.avatar === ''){$scope.otherUserInfo.avatar = "uploads/images/avatars/default.jpg";}
            if ($scope.otherUserInfo.description === undefined || $scope.otherUserInfo.description === ''){$scope.otherUserInfo.description = "";}
            if ($scope.otherUserInfo.location === undefined || $scope.otherUserInfo.location === ''){$scope.otherUserInfo.location = "";}
            if ($scope.otherUserInfo.birth === undefined || $scope.otherUserInfo.birth === ''){$scope.otherUserInfo.birth = "";}
        }
    };
}]);
