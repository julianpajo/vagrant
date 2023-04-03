'use strict';

/**
 * @ngdoc function
 * @name rheticus.controller:FeatureInfoCtrl
 * @description
 * # FeatureInfoCtrl
 * Feature Controller for rheticus project
 */
angular.module('rheticus')
	.controller('FeatureInfoCtrl',['$rootScope','$scope','ArrayService','Flash',function($rootScope,$scope,ArrayService,Flash){

		var self = this; //this controller

		/**
		 * EXPORT AS PUBLIC CONTROLLER
		 */
		angular.extend(self,{
			"overlayName" : "",
			"featureDetails" : [], // Feature details: array of "layerName" objects who have in thier "properties" KVP which are respectively fieldsName and records values
			"show_features" : false, // dialog box closure
			"showFeatures" : function (show){ // showFeatures hides this view and deletes OLs marker
				self.show_features = show;
				if (!show){
					self.psDetails = [];
				}
			}
		});

		$scope.$on("setFeatureInfoClosure",function(e){// jshint ignore:line
			if (self.show_features) {
				self.showFeatures(false);
			}
		});

		/**
		 * WATCHERS
		 */
		// featureCollection watcher for rendering chart line data
		$scope.$watch("iffi",function(iffi){
			//console.log("feature-info-controller.js | watch(iffi): iffi=" + JSON.stringify(iffi));
			self.overlayName = $scope.getOverlayMetadata("iffi").legend.title;
			configurationLayers = $scope.getOverlayMetadata("iffi").custom.LAYERS;
			//console.log("feature-info-controller.js | watch(iffi): configurationLayers = " + JSON.stringify(configurationLayers));

			if (iffi!==null){
				if (iffi.features && (iffi.features!==null) && (iffi.features.length>0)) {
					//console.log("feature-info-controller.js | watch(iffi): num iffi feature = " + iffi.features.length);
					self.showFeatures(
						generateData("iffi",iffi.features)
					);
				} else {
					self.showFeatures(false);
					Flash.create('warning', "Layer \""+self.overlayName+"\" returned no features!");
				}
			}
		});


		/**
		 * PRIVATE  VARIABLES AND METHODS
		 */
		var configurationLayers = [];
		/**
		 * Parameters:
		 * idService - {String}
		 * features - {Array<Object>}
		 *
		 * Returns:
		 */
		var generateData = function(idService, features){
			var res = false;
			var layerList = []; // feature details
			try {
				// parse all features
				//console.log("feature-info-controller.js | generateData | num features: " + features.length);
				for (var i=0; i<features.length; i++) {
					// retrieve features that have "properties" and "layerName" fields following geojson standard
					//console.log("feature-info-controller.js | generateData | feature num " + i);
					if ((features[i].properties) && (features[i].layerName)){

						//retrieve its layer name
						var index;
						var layerName = features[i].layerName;
						var queryable = false;
						//console.log("feature-info-controller.js | generateData | feature layerName = " + layerName);

						if (configurationLayers.length>0){
							index = ArrayService.getIndexByAttributeValue(configurationLayers,"name",layerName);
							if (index!==-1){
								layerName = (configurationLayers[index].name) ? configurationLayers[index].name : "";
								queryable = (configurationLayers[index].queryable) ? configurationLayers[index].queryable : false;
							}
						}

						//console.log("feature-info-controller.js | generateData | layerName = " + layerName);
						//console.log("feature-info-controller.js | generateData | queryable = " + queryable);

						// layer name must be not null and queryable
						if (queryable && layerName!==""){
							try {
								var record = {};
								index = ArrayService.getIndexByAttributeValue(layerList,"layer",layerName);

								if (index===-1){ // add new layer with its first feature

									//retrieve visible layer attributes from configuration
									var configurationAttributes = [];
									var layerFound = false;
									var layerVisibleAttributes = $scope.getOverlayMetadata(idService).custom.ATTRIBUTES;
									for (var configLayer in layerVisibleAttributes) {
										if (layerName.indexOf(configLayer)!==-1){
											configurationAttributes = eval("layerVisibleAttributes."+configLayer); // jshint ignore:line
											layerFound = true;
											break;
										}
									}

									var attributes = [];
									for (var prop in features[i].properties) {
										// layer attributes (i.e. name of its properties)
										if (
											//valid layer attribute
											features[i].properties.hasOwnProperty(prop) &&
											(
												// layer attributes are configured for this layer and only display configured ones
												(layerFound && (configurationAttributes.length>0) && (ArrayService.getIndexByValue(configurationAttributes,prop)!==-1)) ||
												// no layer attributes have been configured for this layer in configuration file
												(!layerFound)
											)
										){
											attributes.push(prop);
											eval("record."+prop+" = features[i].properties."+prop+";"); // jshint ignore:line
										}
									}
									layerList.push({
										"layer" : layerName, // layer name (identifier)
										"attributes" : attributes,
										"records" : [record] // layer fields
									});
								} else { // update existing layer with current feature
									for (var k=0; k<layerList[index].attributes.length; k++) {
										eval("record."+layerList[index].attributes[k]+" = features[i].properties."+layerList[index].attributes[k]+";"); // jshint ignore:line
									}
									layerList[index].records.push(record);
								}

							} catch (e) {
								console.log("[feature-info-controller :: generateData] EXCEPTION : 'layerName' attribute doesn't exists!");
							} finally {
								// do nothing ... continue parsing other features!
							}
						}

					}
				}
				if (layerList.length>0){
					res = true;
				}
			} catch (e) {
				console.log("[feature-info-controller :: generateData] EXCEPTION : '"+e);
				layerList = []; // this empties the list if dirty
			} finally {
				self.featureDetails = layerList;
				if(!$scope.$$phase) {
					$scope.$apply();
				}
				return(res);
			}
		};
	}]);
