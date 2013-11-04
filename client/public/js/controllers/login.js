Modules.controllers.controller('LoginController', ['$rootScope', '$scope', '$http', '$location', 'Session','Mails','Remember', 'User', 'Valid',
    function($rootScope, $scope, $http, $location, Session, Mails ,Remember, User, Valid) {

    //Checks if any string was send via url
    if(($location.search()).id_valid == null || ($location.search()).id_valid == ""){
        console.log("No url");
    }
    else{
        $scope.Valid = new Valid();
        $scope.Valid.id_valid = $location.search().id_valid;
        
        //Update to valid
        $scope.Valid.$save(function(res) {
            $rootScope.user = res;
            $scope.permissions.invalidUserInfo = false;
            $location.path("/chat");
        },
        function(res){
            //Error
        });
    }
    angular.element(".container.trs , .view , html , body ").addClass("fullHeight");

    //Validations
    $scope.permissions = {
        invalidUserInfo: false
    };
    
    $scope.validations = {
        duplicatedEmail: false,
        duplicatedUser: false,
        invalidEmailFormat: false,
        invalidUsername: false
    };
    
    $scope.loginValidations = {
        userSessionExist: false
    };
    $scope.password = {
        remember: false,
        remembererror: false
    };
    
    $scope.succesMesages = {
        creationSucces: false
    };
    
    //Session
    $scope.session = new Session();
    //User
    $scope.userObject = new User();
    //Mail
    $scope.Mails = new Mails();
    //Remember password
    $scope.Remember = new Remember();
    
    
    //Redireccion si ya está logueado
    Session.get(function(response) {
        if ((response !== null ? response._id : void 0) !== null) {
            if (response._id !== null && response._id !== undefined){
                $scope.loginValidations.userSessionExist = true;
                //$location.path("/welcome");
            }
        }
    }, function(response) {
        //error
    });
    
    $scope.fullscreen = function(){
        
        $.fn.fullpage({
            slidesColor: ['#1bbc9b', '#4BBFC3', '#7BAABE'],
            afterRender: function(){
                $('span.welcome').addClass('active');
                $( ".centerform" ).css( "position", "relative" );
                $( ".centerform" ).css( "left", "100%" );
            },
            onLeave: function(index, direction){
                //after leaving section 2
                if(index == '2' || index == '3' || direction =='down' || direction =='up'){
                    $( ".centerform" ).css( "left", "100%" );
                }
            },
            afterLoad: function(anchorLink, index){
                
                //after leaving section 2
                if(index == '3'){
                    $( ".centerform" ).css( "left", "0" );
                    $('span.welcome').removeClass('active');
                    $('span.signin').removeClass('active');
                    $('span.signup').addClass('active');
                }
                if(index == '2'){
                    $( ".centerform" ).css( "left", "0" );
                    $('span.welcome').removeClass('active');
                    $('span.signin').addClass('active');
                    $('span.signup').removeClass('active');
                }
                if(index == '1'){
                    $('span.welcome').addClass('active');
                    $('span.signin').removeClass('active');
                    $('span.signup').removeClass('active');
                }
            }
        });
        $( "span.welcome" ).click(function() {
            $.fn.fullpage.moveToSlide(1); 
        });
        $( "#signup , span.signup" ).click(function() {
            $.fn.fullpage.moveToSlide(3); 
        });
        $( "#signin , span.signin" ).click(function() {
            $.fn.fullpage.moveToSlide(2); 
        });
        $('.controlArrow.next').append('<p>&rsaquo;</p>');
        $('.controlArrow.prev').append('<p>&lsaquo;</p>');
        $(".arrow-down").delay(500)
        .animate({bottom: "13px"}, {duration: 400, queue: true})
        .animate({bottom: "103px"}, {duration: 200, queue: true})
        .animate({opacity: "0"}, {duration: 200, queue: true});
        $(".arrow-right").delay(500)
        .animate({right: "6px"}, {duration: 400, queue: true})
        .animate({right: "96px"}, {duration: 200, queue: true})
        .animate({opacity: "0"}, {duration: 200, queue: true});
    };
    
    $scope.forgotpass = function(){
        $scope.Remember.$save(function(res) {
            $scope.password.remember = true;
            $scope.password.remembererror = false;
        },
        function(res){
            $scope.password.remember = false;
            $scope.password.remembererror = true;
        });
    };     
    
    //Login action button
    $scope.submitLogin = function () {
        
        $scope.session.$save(function(res) {
            $rootScope.user = res.user;
            $scope.permissions.invalidUserInfo = false;
            $location.path("/chat");
        },
        function(res){
            switch (res.status) {
                case 403:
                    $scope.permissions.invalidUserInfo = true; //Invalid user or password
            }
        });
    };
    
    //Register action button
    $scope.submitRegister = function () {
        var locaUser = $scope.userObject.user.username;
        var localPass = $scope.userObject.user.password;
        
        $scope.userObject.$save(function(res){
            $scope.Mails.user = res.user;
            $scope.Mails.$save(function(resMails){
                console.log('exito');
            }, 
            function(error) {
                console.log('error');
            });
            
            $scope.permissions.invalidUserInfo = false;
            $scope.validations.invalidEmailFormat = false;
            $scope.validations.invalidUsername = false;
            $scope.succesMesages.creationSucces = true;
            $scope.session.username = locaUser;
            $scope.session.password = localPass;
            $scope.submitLogin();
        },
        function(res){
            switch (res.status) {
                case 400:
                    var countErrors = res.data.errors.length;
                    for (var i = 0; i < countErrors; i++){
                        switch (res.data.errors[i].path) {
                            case 'email':
                                $scope.validations.invalidEmailFormat = true;
                                break;
                            case 'username':
                                $scope.validations.invalidUsername = true;
                                break;
                        }
                    }
                    break;
            }
        });
        
    };
    
    
}]);
