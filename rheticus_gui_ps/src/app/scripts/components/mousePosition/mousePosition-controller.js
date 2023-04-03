'use strict';

/**
 * @ngdoc function
 * @name rheticus.controller:mousePositionController
 * @description
 * # mousePositionController
 * mousePositionController
 */
angular.module('rheticus')
	.controller('mousePositionController',['$scope','configuration','olData',function($scope,configuration,olData){
		$scope.point="";

    	//OLS Map interation
		$scope.mapsIds.forEach(function(id) {
			olData.getMap(id).then(function (map) {
				//pointermove event
				map.on("pointermove", function (evt) {
					document.getElementById('divMP').style.backgroundColor ="rgba(0, 60, 136, 0.6)";
					var point = ol.proj.toLonLat(evt.coordinate,"EPSG:3857"); // jshint ignore:line
					$scope.point=Math.round(point[1]*100000)/100000+","+Math.round(point[0]*100000)/100000;
					$scope.$apply();
				});
			});
		});
}]);
