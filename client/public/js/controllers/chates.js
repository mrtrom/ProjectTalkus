Modules.controllers.controller('ChatesController', ['$routeParams', '$rootScope', '$scope', '$http', '$location',  'Session', 'User',
    function($routeParams, $rootScope, $scope, $http, $location, Session , User) {
    /*Session.get(function(response) {
        if ((response !== null ? response._id : void 0) !== null) {
            $rootScope.user = response;
            $scope.username = response.username;
        }
    }, function(response) {
        
    });*/
    User.get({
      username: 'meme'
    }, function(response) {
    
      $scope.profileUser = response;
      
    }, function(response) {
        console.log(response);
      //return $location.path('/');
    });
    
    /*User.get(function(res) {
        console.log(res);
        
    }, function(res) {
        
    });*/
    
}]);
