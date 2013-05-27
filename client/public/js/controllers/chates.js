Modules.controllers.controller('ChatesController', ['$rootScope', '$scope', '$http', '$location',  'Session',
    function($rootScope, $scope, $http, $location, Session) {
    
    Session.get(function(response) {
        if ((response !== null ? response._id : void 0) !== null) {
            $rootScope.user = response;
            $scope.username = response.username;
        }
    }, function(response) {
        
    });
    
}]);
