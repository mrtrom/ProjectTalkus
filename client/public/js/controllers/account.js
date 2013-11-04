Modules.controllers.controller('AccountController', ['$routeParams', '$rootScope', '$scope', '$http', '$location', '$filter', 'Session', 'User', 'Mails' , 'ChatUser',
    function($routeParams, $rootScope, $scope, $http, $location, $filter, Session, User, Mails, ChatUser) {
    var socket = io.connect(document.URL);
    $scope.initchat = function(){
        $('html').addClass('chat');
        $("#locationapi").geocomplete();
        socket.on('connect', function(){
            ShowLoading();
            var username = $('#username').val();
            socket.emit('adduser', username);
        });
        
        socket.on('updatechat', function (username, data, type) {
            $('#conversation').append('<div><i class="icon-user"></i> <span class="text-info">'+username + ':</span> ' + data + '</div>');
            if (type != 'undefined'){
                if (type == 'leave'){
                    ShowLoading();
                }
            }
        });
        
        socket.on('updateAnonymInfo', function (username, user) {
            $('#confirm').click();
            HideLoading();
        });
        
        $('#datasend').on('click', function() {
            var cadenaAEliminar = /(<([^>]+)>)/gi;
            var elementoEtiquetas = $('#data');
            var etiquetas = elementoEtiquetas.val();
            etiquetas = etiquetas.replace(cadenaAEliminar, '');
            elementoEtiquetas.val(etiquetas);
            mensaje = elementoEtiquetas.val();
            
            $('#data').val('');
            socket.emit('sendchat', mensaje);
        });
        
        $('#data').keypress(function(e) {
            if(e.which == 13) {
                $(this).blur();
                $('#datasend').focus().click();
                $('#data').focus();
            }
        });
        $('.superContainer').css('top','0');
        $('div.inside').jScrollPane();
    }
    $scope.newpermit = {
        days: false ,
        email: false
    };
    $scope.validations = {
        anonymUser: true,
        anonymOtherUser: true
    };
    
    $scope.userInformation = new User();
    $scope.otherUserInfo = new User();
    
    var googleBool = false;
    
    //get user session
    $scope.loadInfo = function () {
        //Get the user info by the session
        Session.get(function(response) {
            if ((response !== null ? response._id : void 0) !== null) {
                if (response._id !== null && response._id !== undefined){
                    
                    //User info and User birth in format (dd/MM/yyyy)
                    $scope.userInformation = response;
                    $scope.userInformation.birth = $filter('date')(new Date($scope.userInformation.birth), 'dd/MM/yyyy');
                    
                    //Validations
                        //-Not a anonym user, just a loged user.
                        $scope.validations.anonymUser = false;
                    
                    //Calculate how many days left before profile delete
                    if($scope.userInformation.confirmed !== "true"){
                        
                        //Show days left in account
                        $scope.newpermit.days = true;
                        
                        var createdDate = new Date($scope.userInformation.created), //Account created date
                            realRest = Math.floor((new Date() - createdDate) / 86400000); //days diff between dates
                        
                        if(realRest >= 15){}else{
                            //Show adv days left
                            $scope.days = 15 - realRest;
                        }
                    }
                    else{
                        //It's a confirmed account, and dont need any action.
                    }
                }
            }
            
            //User validation
            if ($scope.userInformation.username === undefined || $scope.userInformation.username === ''){
                ChatUser.getUsername({username: 'get'},
                function(response) {
                    $scope.userInformation.username = 'anonym' + response.count;
                }, function(response) {
                    //error
                });
            }
            
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
    
    //user delete account
    $scope.deleteAccount = function(){
        User.delete({username : $scope.userInformation._id},
        function(response){
            //Exito
        },
        function(error){
            //Error
        });
    };
    
    //email resend
    $scope.resend = function(){
        Mails.delete(function(res) {
            //exito
        },
        function () {
            //error
        });
        $scope.newpermit.email = true;
    };
    
    /*upload images*/
    $('#fileimg').change(function(){
        $('#imgbtn').click();
    });
    
    $scope.uploadClick = function(){
        $('#fileimg').click();
    };
    
    /*End images*/
    $scope.deletePhoto = function(){
        $scope.userInformation.avatar = "/uploads/images/avatars/default.jpg";
        updateUserAll();
    };
    
    //user image is shown
    $scope.uploadImage = function(content){
        if(content.path === undefined || content.path === ""){
        }else{
            //trim path, quite lo que no necesita, con tal que a la final el path queda /uploads/images/avatars[[image.jpg]]
            $scope.userInformation.avatar = content.path.substr(content.path.indexOf("/uploads/images/avatars/") + 1);
            
            //se debe hacer aqui el mismo update
            updateUserAll();
        }
    };
    
    //general update function
    $scope.updateUsers = function () {
        updateUserAll();
    };
    
    $scope.pullDown = function(){
        console.log("push down");
    };
    
    //When GPS is enable, it will get users location
    $scope.locationBool = function () {
        if(googleBool === false){
            googleBool = true;
            $scope.userInformation.location = document.getElementById('locationapi').value;
        }else{
            $scope.userInformation.location = '';
            googleBool = false;
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
    
    //logout
    $scope.logout = function(){
        
        Session.delete(function(response) {
            console.log(socket);
            $('.preview-loading').hide();
            $location.path("/");
        });
    };
    
    /*Javascript section*/
        
    //datePicker for users b-day
    $(function() {
        $( "#datepicker" ).datepicker({
            onSelect: function(dateText, inst) { 
               $scope.userInformation.birth = dateText;
               updateUserAll();
            },
            changeMonth: true,
            changeYear: true,
            yearRange: "-80:+0",
            dateFormat: 'dd/mm/yy'
        });
    });
      
    //update user info
    $(".FocusAccion").focusout(function() {
        updateUserAll();
    });
    
    //Here is where the users update function is called when needed
    function updateUserAll(){
    User.update($scope.userInformation,
        function (data) {
            console.log('modificó');
        }, function ($http) {
            //error
            console.log("Couldn't save user.");
        });
    }
    
    /*End javascript section*/
    
}]);
