'use strict';

/**
 * @ngdoc function
 * @name rheticus.controller:BasemapPopoupCtrl
 * @description
 * # BasemapPopoupCtrl
 * Basemap Popoup Controller for rheticus project
 */
angular.module('rheticus')
	.controller('BasemapPopoupCtrl',['$scope','configuration', 'SessionService', function($scope,configuration, SessionService){
		var self = this;

		$scope.$on('updateBaseMap', function(event, selected_view) { 
			if(selected_view){
				self.selected_view = selected_view ;
				self.changeBaseLayer();	
			}
		});
		

		angular.extend(self,{
			"selected_view": SessionService.getData("customBaseMap") || 'Here',
			"changeBaseLayerOSM": function() {
					self.selected_view = "OpenStreetMap";
					$scope.getBaselayers()[0].active=true;
					$scope.getBaselayers()[1].active=false;
			},
			"changeBaseLayerSBMLABEL": function() {
					self.selected_view = "Here";
					$scope.getBaselayers()[0].active=false;
					$scope.getBaselayers()[1].active=true;
			},
			"changeBaseLayer": function () {
				switch (self.selected_view) {
					case "OpenStreetMap":
						self.changeBaseLayerOSM();
						break;
					case "Here":
						self.changeBaseLayerSBMLABEL();
						break;
					default:
						break;
				}}
		});		

	}]);
