'use strict';

/*global $:false */
/*global Modules:false */

Modules.controllers.controller('MenuController', ['$rootScope', '$scope', '$http', '$location','$modal', 'Session',
	function($rootScope, $scope, $http, $location, $modal, Session) {

		$scope.logoValidate = function(){
			//Redireccion si ya está logueado
			Session.get(function(response) {
				if ((response !== null ? response._id : void 0) !== null) {
					if (response._id !== null && response._id !== undefined){
					}
					else{
						$location.path('/');
					}
				}
			}, function(response) {
				//error
			});
		};

	}]);
