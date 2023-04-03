'use strict';

/**
 * @ngdoc function
 * @name rheticus.controller:TimelineCtrl
 * @description
 * # TimelineCtrl
 * Timeline Controller for rheticus project
 */
angular.module('rheticus')
	.controller('TimelineCtrl',['$window', '$rootScope','$scope','configuration','ArrayService','SpatialService',function($window, $rootScope,$scope,configuration,ArrayService,SpatialService){

		var self = this; //this controller

		/**
		 * PUBLIC VARIABLES AND METHODS
		 */
		var showTimeline = function (show){
			self.show_timeline = show;
			self.trendCrop = false;
			$rootScope.markerVisibility = show;
			$scope.setSentinelExtent([]);
			if (!show){
				self.data = [];
			}
		};


		/**
		 * EXPORT AS PUBLIC CONTROLLER
		 */
		angular.extend(self,{
			"trendCrop" : false,
			"show_timeline" : false, // dialog box closure
			"showTimeline" : showTimeline,
			"data" : [],
			"tableData" :[],
			"dataTrend" : [],
			"totalProduct" : 0,
			"totalCrop" : 0,
			// Chart options
			"options" : {
				"chart" : {
					"height" : 220,
					"width" : 500,
					"showLegend": false,
					"type" : "discreteBarChart",
					"x" : function(d){
						return d.label;
					},
					"y" : function(d){
						return parseInt(d.value);
					},
					"valueFormat": function(d){
						return d3.format(',.0f')(d); // jshint ignore:line
					},
					"xAxis" : {
						"axisLabel" : "Crop"
					},
					"yAxis" : {
						"axisLabel" : "Count",
						"axisLabelDistance" : -10
					},
					"showValues" : true,
					"discretebar": {
					  "dispatch": {
							"elementClick": function(e){ //chartClick: function(e) {console.log("! chart Click !")},
								self.trendCrop=true;		//change ng-show variable
								self.dataTrend=getTableData(e.data.features);
								self.tableData=e.data;
								$rootScope.closeTimeline=false;
							    var jsonExtent =  getExtentSuperMaster(e.data.features);
								$scope.setSentinelExtent(jsonExtent);
								$scope.$apply(); //update view
							}
						}
					},
					"useInteractiveGuideline" : false,
					"interactive" : true,
					"tooltip" : {
						enable : true,
						contentGenerator : function(d) {
							return '<p><b> ' + d.data.label + '</b> alias: <b>' + d.data.id + ' </b></p>' +
								'<p  style="text-align:left;">'+' Total products: '  +  d.data.value + '</p>'+
								'<p  style="text-align:left;">'+' Family name: '  +  d.data.features[0].properties.familyName + '</p>'+
								'<p  style="text-align:left;">'+' Pass: '  +  d.data.features[0].properties.pass + '</p>'+
								'<p  style="text-align:left;">'+' Swath: '  +  d.data.features[0].properties.swath + '</p>'+
								'<p  style="text-align:left;">'+' ProductType: '  +  d.data.features[0].properties.productType + '</p>'+
								'<p  style="text-align:left;">'+' ProductClass: '  +  d.data.features[0].properties.productClass + '</p>'+
								'<p  style="text-align:left;">'+' RelativeOrbitNumber: '  +  d.data.features[0].properties.relativeOrbitNumberTypeStart + '</p>'+
								'<p  style="text-align:left;">'+' TransmitterReceiverPolarisation: '  +  d.data.features[0].properties.transmitterReceiverPolarisation + '</p>';
						}
					},
					"transitionDuration" : 250,
					"noData" : "Sorry... no data found"
				}
			},
			// Chart options
			"optionsTrend" : {
				"chart" : {
					"showLegend": false,
					"type" : "lineChart",
					"x" : function(d){
						return d.x;
					},
					"y" : function(d){
						return d.y;
					},
					"xAxis": {
						"axisLabel": 'Acquisitions day',
						"tickFormat" : function (d) {
							return d3.time.format("%d/%m/%Y")(new Date(d)); // jshint ignore:line
						},
					},
					"yAxis": {
						"axisLabel": 'Count',
					},
					"noData" : "Loading",
					margin : {
						right: 50,
						left: 80
					},
					"width" : 320,
					"height" : 200,
					"showDistX" : true,
					"showDistY" : true,
					"useInteractiveGuideline" : false,
					"interactive" : true,

					"tooltip" : {
						enable : true,
						contentGenerator : function(d) {
							var dateString = d.point.data.startTime;
							var day = dateString.substring(8,10);
							var month = dateString.substring(5,7);
							var year = dateString.substring(0,4);
							dateString=day+'/'+month+'/'+year;
							return '<p><b> UUID: ' + d.point.data.uuid  + ' </b></p>' +
								'<p  style="text-align:left;">'+' Acquisition Day: '  +  dateString + '</p>'+
								'<p  style="text-align:left;">'+' Total products: '  +  d.point.y + '</p>';
						}
					}
				},
				"title" : {
					enable : true,
					html : "<b>Acquisitions History</b>"
				},
			}
		});


		$scope.$on("setTimelineClosure",function(e){ // jshint ignore:line
			if (self.show_timeline && $rootScope.closeTimeline) {
				self.showTimeline(false);
			}
		});

		/**
		 * WATCHERS
		 */
		// ps watcher for rendering chart line data
		$scope.$watch("sentinel",function(timeline) {

			if ((timeline!==null) && (timeline.features!==null) && (timeline.features.length)) {
				var cropList = normalizeCropList(timeline);
				showTimeline($scope.generateChartData(cropList)
				);
			} else {
				showTimeline(false);
			}
		});

		var getTableData= function (features){
			features.sort(function(a,b) {
				if (convertDate(a.properties.startTime) < convertDate(b.properties.startTime)){
					return -1;
				}
				if (convertDate(a.properties.startTime) > convertDate(b.properties.startTime)){
					return 1;
				}
				return 0;
			});

			var featureValue = [];
			var dateLong =[];
			for (var i = 0; i < features.length; i++) {//get long value for date
				dateLong = convertDate(features[i].properties.startTime);
      	featureValue.push({x: dateLong, y: i+1,data:features[i].properties});
      }
			$scope.$apply();			//update view
			//console.log(featureValue);
			return [{
	      values: featureValue,      //values - represents the array of {x,y} data points
	      key: 'Total products', //key  - the name of the series.
	      color: '#ff7f0e',  //color - optional: choose your own line color.
				mean: 20
      }];
		};

		var getExtentSuperMaster= function (features){
			var coordinates=[];
			var i = 0;
			while ( i < features.length  ) {
				coordinates.push(features[i].geometry.coordinates);
				i++;
      }
			//console.log(coordinates);
			return coordinates;
		};

		var convertDate= function (dateString){
			var day = dateString.substring(8,10);
			var month = dateString.substring(5,7)-1;
			var year = dateString.substring(0,4);
			var d = new Date();
			d.setFullYear(year);
			d.setMonth(month);
			d.setDate(day);
			return d.getTime();
		};

		/**
		 * PRIVATE VARIABLES AND METHODS
		 */
		/**
		 * Parameters:
		 * timeline - {Object}
		 *
		 * Returns:
		 * Array<{Object}> - Crop list
		 */
		var normalizeCropList = function(timeline){
			var cropIdAttribute = configuration.timeSlider.attributes.cropIdentifier;
			var cropList = [];
			try {
				self.totalProduct=timeline.features.length;
				for (var i=0; i<timeline.features.length; i++) {
					if (timeline.features[i].properties){
						var cropValue = timeline.features[i].properties.cropId;
						try {
							var index = ArrayService.getIndexByAttributeValue(cropList,"id",cropValue);

							if (index===-1){ // add new crop
								cropList.push({
									"id" : cropValue,
									"bbox" : SpatialService.boundingBoxAroundPolyCoords(timeline.features[i].geometry.coordinates),
									"features" : [timeline.features[i]]
								});
							} else { // update bbox of existing crop
								cropList[index].bbox = SpatialService.updateCropBoundingBox(cropList[index].bbox,SpatialService.boundingBoxAroundPolyCoords(timeline.features[i].geometry.coordinates));
								cropList[index].features.push(timeline.features[i]);
							}

						} catch (e) {
							console.log("[timeline-controller :: normalizeCropList] EXCEPTION : '"+cropIdAttribute+"' attribute doesn't exists!");
						} finally {
							// do nothing ... continue parsing other features!
						}
					}
				}
				//sort cropList
				cropList.sort(function(a,b) {
					if (a.features.length < b.features.length){
						return -1;
					}
					if (a.features.length > b.features.length){
						return 1;
					}
					return 0;
				});
				cropList.reverse();
			} catch (e) {
				console.log("[timeline-controller :: normalizecropList] EXCEPTION : '"+e);
				cropList = []; // this empties the list if dirty
			} finally {
				return(cropList);
			}
		};

		/**
		 * Parameters:
		 *
		 * Returns:
		 */
		$scope.generateChartData = function(cropList){
			var alphabet =['A','B','C','D','E','F','G','H','I','L','M','N','0','P'] ;
			self.totalCrop=0;
			var res = false;
			if (cropList.length>9){
				cropList.length=10; // max array size to be displayed
			}
			try {
				if ((cropList!==null) && (cropList.length>0)){
					//Line chart data should be sent as an array of series objects.
					var chartData = []; //Data is represented as an array of {x,y} pairs.
					for (var i=0; i<cropList.length; i++) {
						try {
							if(cropList[i].features.length>5){ // set a minimum cardinality to view a crop
								self.totalCrop++;
								chartData.push({
									"label" : alphabet[i], // alias crop ID value
									"id" : cropList[i].id, // crop id
									"value" : cropList[i].features.length, // values - represents the crop's cardinality
									"features" : cropList[i].features
								});
							}
						} catch (e) {
							console.log("[timeline-controller :: generateChartData] EXCEPTION adding data to chart: "+e);
						} finally {
							// do nothing and continue
						}
					}
					var chartDataExternal = [];
					chartDataExternal.push({
						"key" : "prova",
						"values" : chartData
					});
					self.data =chartDataExternal;
					$scope.api.refresh();
					res = true;
				}
			} catch (e) {
				console.log("[ps-trends-controller :: generateChartData] EXCEPTION : '"+e);
			} finally {
				return(res);
			}
		};


	}]);
