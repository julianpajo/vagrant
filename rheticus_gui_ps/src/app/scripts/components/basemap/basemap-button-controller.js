'use strict';

/**
 * @ngdoc function
 * @name rheticus.controller:BasemapButtonCtrl
 * @description
 * # BasemapButtonCtrl
 * Basemap Button Controller for rheticus project
 */
angular.module('rheticus')
	.controller('BasemapButtonCtrl',['$scope',function ($scope){
		angular.extend(this,{
			"mapPopup" : "scripts/components/basemap/basemap-popup-view.html",
			"getShow" : function(){
				return $scope.getController("basemap");
			},
			"setShow" : function(){
				$scope.setController("basemap");
			}
		});
	}]);
