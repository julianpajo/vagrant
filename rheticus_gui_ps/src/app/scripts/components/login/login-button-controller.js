'use strict';

/**
 * @ngdoc function
 * @name rheticus.controller:LoginButtonCtrl
 * @description
 * # LoginButtonCtrl
 * Login Button Controller for rheticus project
 */
angular.module('rheticus')
	.controller('LoginButtonCtrl',['$scope',function($scope){
		angular.extend(this,{
			"loginPopup" : "scripts/components/login/login-popup-view.html",
			"getShow" : function(){
				return $scope.getController("login");
			},
			"setShow" : function(){
				$scope.setController("login");
			}
		});
	}]);
