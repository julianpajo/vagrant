'use strict';

/**
 * @ngdoc function
 * @name rheticus.controller:GeocoderCtrl
 * @description
 * # GeocoderCtrl
 * Geocoder Controller for rheticus project
 */
angular.module('rheticus')
	.controller('GeocoderCtrl',['$scope','$rootScope', 'GeocodingService','olData', function($scope, $rootScope, GeocodingService, olData){

		var self = this; //this controller
		var lengthLocationName=0;
		self.isLoading = false;

		var getIsLocationLoading = function() {
			return GeocodingService.getIsLocationLoading();
		};

		var searchLocation = function(event){
			lengthLocationName=this.location.length;
			if (event.which !== 13){ // 13 = ENTER EVENT
				self.results = [];
				self.isLoading = true;
				var isWaiting = GeocodingService.geocode(this.location, searchLocationCallback);
				var isWaitingTmp = GeocodingService.getScattererByCode(this.location, searchLocationCallback);
				isWaiting = isWaiting || isWaitingTmp;
				isWaitingTmp = GeocodingService.getScattererByUniqueCode(this.location, searchLocationCallback);
				isWaiting = isWaiting || isWaitingTmp;
				if (!isWaiting) {
					self.isLoading = false;
				}
			} else{
				self.isLoading = false;
				getLocation(0); // GET FIRST RESULT
			}
		};

		var searchLocationCallback = function(list,size){
			if(lengthLocationName===size){
				self.isLoading = false;
				if(list.length > 0){
					self.results = (list!==null) ? list : [];
				}
			}
		};

		var getLocation = function(index){
			if(self.results[index]){
				var jsonLocation = self.results[index];
				if(jsonLocation.geojson){
					//jsonLocation.geojson.type == Polygon
					$scope.setMapViewExtent(
						jsonLocation.geojson.type,
						jsonLocation.geojson.coordinates
					);
				}else{
					var latLonObj;
					var latLonArray;
					if(jsonLocation.ps){
						latLonObj = {
							lat: jsonLocation.ps.lat,
							lon: jsonLocation.ps.lon,
							zoom: 20
						};
						latLonArray = [jsonLocation.ps.lon, jsonLocation.ps.lat];
					} else if(jsonLocation.ds){
						latLonObj = {
							lat: jsonLocation.ds.lat,
							lon: jsonLocation.ds.lon,
							zoom: 20
						};
						latLonArray =  [jsonLocation.ds.lon, jsonLocation.ds.lat];
					} else if(jsonLocation.cr){
						latLonObj = {
							lat: jsonLocation.cr.lat,
							lon: jsonLocation.cr.lon,
							zoom: 20
						};
						latLonArray =  [jsonLocation.cr.lon, jsonLocation.cr.lat];
					}
					$scope.mapsIds.forEach(function(id) {
						olData.getMap(id).then(function (map) {
							var centerXY = ol.proj.transform(latLonArray, 'EPSG:4326','EPSG:3857');
							map.getView().setCenter(centerXY);
							map.getView().setZoom(latLonObj.zoom);
						});
					});
					setTimeout(function (){
						$rootScope.$broadcast("openPsTrends", latLonArray);
					}, 1500);
				}
				self.results = {};
				self.location = "";
				self.visibleSearchBar=false;
				if(document.getElementById('searchForm')){
					document.getElementById('searchForm').style.width="50px";
				}
			}
		};


		angular.extend(self,{
			"results" : {},
			"location" : "",
			"visibleSearchBar" : false,
			"getShow" : function(){
				return $scope.getController("geocoder");
			},
			"setShow" : function(){
				$scope.setController("geocoder");
			},
			"showSearchBar" : function(){
				self.visibleSearchBar=!self.visibleSearchBar;
				if(self.visibleSearchBar){
					if(document.getElementById('searchForm')){
						document.getElementById('searchForm').style.width="300px";
					}

				}else{
					if(document.getElementById('searchForm')){
						document.getElementById('searchForm').style.width="50px";
					}
				}

			},
			"getLocation" : getLocation,
			"searchLocation" : searchLocation,
			"getIsLocationLoading": getIsLocationLoading
		});

	}]);
