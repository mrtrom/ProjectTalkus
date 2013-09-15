Modules.controllers.controller('WelcomeController', ['$routeParams', '$rootScope', '$scope', '$http', '$location','Valid',
    function($routeParams, $rootScope, $scope, $http, $location, Valid) {
        
        //Checks if any string was send via url
        if(($location.search()).id_valid == null || ($location.search()).id_valid == ""){
            //Error message
            console.log("No url");
        }
        else{
            //Valid Backend declare
            $scope.Valid = new Valid();
            
            //Gets ID from URL
            var id_object = {
                id_valid: ($location.search()).id_valid
            };
            
            //Update to valid
            $scope.Valid.$save(id_object);
        }
        jQuery(".container.trs , .view , html , body ").addClass("fullHeight");
        
}]);
