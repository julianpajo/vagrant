'use strict';

/**
 * @ngdoc function
 * @name rheticus.controller:CreditsController
 * @description
 * # CreditsController
 * Credits Controller for rheticus project
 */
angular.module('rheticus')
	.controller('CreditsController',['$scope',function($scope){
		angular.extend(this,{
			"baselayers" : $scope.getBaselayers(),
			"overlays" : $scope.getOverlays()
		});
	}]);
