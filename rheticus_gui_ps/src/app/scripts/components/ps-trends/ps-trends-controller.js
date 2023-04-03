'use strict';

/**
 * @ngdoc function
 * @name rheticus.controller:PsTrendsCtrl
 * @description
 * # PsTrendsCtrl
 * PS Trends Controller for rheticus project
 */
angular.module('rheticus')
	.controller('PsTrendsCtrl', ['$rootScope', '$scope', '$translate', 'configuration', '$http', '$mdDialog', '$mdMedia' , 'GeocodingService', 'ArrayService', 'Flash', 'BookmarkScattererService', 'olData',
		function ($rootScope, $scope, $translate, configuration, $http, $mdDialog, $mdMedia, GeocodingService, ArrayService, Flash, BookmarkScattererService, olData) {

			var self = this;
			var host = configuration.rheticusAPI.host
				.replace("locationHost", document.location.host)
				.replace("locationProtocol", document.location.protocol);
			var amplitudes = [];
			var brushExtent = [];
			var oldPeriod = '';

			var oldLastDatePs = 0;
			var oldFirstDatePs = 0;

			var psRequestIndex = 0;

			/**
			 * EXPORT AS PUBLIC CONTROLLER
			 */
			angular.extend(self, {
				"options": { // PS Line chart options

					"chart": {
						"type": "linePlusBarChart",
						"height": 300,
						"margin": {
							"top": 30,
							"right": 90,
							"bottom": 50,
							"left": 80
						},
						"lines": { // for bar chart
							"yDomain": [0, 1],
						},
						"focusEnable": true,
						"switchYAxisOrder": true,
						"focusShowAxisX": true,
						"focusShowAxisY": false,
						"focusMargin": {
							"top": 0,
							"bottom": 20,
							"left": 30,
							"right": 60
						},
						"x": function (d) { return d.x; },
						"y": function (d) { return d.y; },
						"showValues": true,
						"color": [
							"#ff7f0e",
							"#2ca02c",
							"#d62728",
							"#9467bd",
							"#8c564b",
							"#e377c2",
							"#7f7f7f",
							"#bcbd22",
							"#17becf"
						],
						"xAxis": {
							"axisLabel": "Date",
							"tickFormat": function (d) {
								return d3.time.format("%d/%m/%Y")(new Date(d)); // jshint ignore:line
							},
							"tickPadding": 10
						},
						"x2Axis": {
							//"axisLabel" : "Timeline",
							"tickFormat": function (d) {
								return d3.time.format('%b-%Y')(new Date(d)); // jshint ignore:line
							},
							"tickPadding": 10
						},
						"y1Axis": {
							// NOTE: for this type of chart, y1Axis is ALWAYS assigned to the "bar" charts
							"axisLabel": $translate.instant('y1Axis.axisLabelRainfall'),
							"tickFormat": function (d) {
								return d3.format(',.1f')(d); // jshint ignore:line
							},
							"axisLabelDistance": 10
						},
						"y2Axis": {
							"axisLabel": $translate.instant('y2Axis.axisLabel'),
							"tickFormat": function (d) {
								return d3.format(',.1f')(d); // jshint ignore:line
							},
							"axisLabelDistance": 1,
							"ticks": 5

						},
						"y3Axis": {
							"tickFormat": function (d) {
								return d3.format(',.1f')(d); // jshint ignore:line
							},
						},
						"y4Axis": {
							"tickFormat": function (d) {
								return d3.format(',.1f')(d); // jshint ignore:line
							},
						},
						"dispatch": {
							"brush": function (b) {
								brushExtent = [b.extent[0], b.extent[1]]
							}
						},
						"callback": function () {
							Flash.dismiss();
						},
						//custom Tooltip
						"tooltip": {
							enable: true,
							gravity: "e",
							duration: 100,
							snapDistance: 25,
							contentGenerator: function (d) {
								var isRainfallShow = self.comboboxSecondMeasurement.value === 'rainfall';
								var dataPoint = (d3.time.format("%d/%m/%Y")(d.value)); // jshint ignore:line
								if (typeof d.point !== 'undefined') {
									var sAux = '<div id="circle" style="height=20px; width=20px;" ><a style="font-size: 20px; color: ' + d.point.color + ';" > &#x25CF;</a><b>' + dataPoint + '</b></div><b>&nbsp;ID: </b>' + d.point.key + '&nbsp;</br><b>&nbsp;' + 'Rheticus Displacement' + ':  </b> ' + d.point.y + ' mm ';
									if (typeof d.point.slope !== 'undefined') {
										sAux += '&nbsp;</br><b>&nbsp;Velocity:  </b> ' + d.point.slope + ' mm/year';
									}
									return sAux;
								} else if (self.isCumulative30) {
									return '<div id="circle" style="height=20px; width=20px;" ><a style="font-size: 20px; color: #1e90ff; " > &#x25CF;</a><b>' + dataPoint + '</b></div><p>' + d.data.key + '<b>  ' + d.data.y + ' ' + self.changeMeasurementUnitForAmplitudeBar(isRainfallShow, 'mm/30 days') + ' </b></p>';
								} else if (self.isCumulative60) {
									return '<div id="circle" style="height=20px; width=20px;" ><a style="font-size: 20px; color: #1e90ff; " > &#x25CF;</a><b>' + dataPoint + '</b></div><p>' + d.data.key + '<b>  ' + d.data.y + ' ' + self.changeMeasurementUnitForAmplitudeBar(isRainfallShow, 'mm/60 days') + ' </b></p>';
								} else if (self.isCumulative90) {
									return '<div id="circle" style="height=20px; width=20px;" ><a style="font-size: 20px; color: #1e90ff; " > &#x25CF;</a><b>' + dataPoint + '</b></div><p>' + d.data.key + '<b>  ' + d.data.y + ' ' + self.changeMeasurementUnitForAmplitudeBar(isRainfallShow, 'mm/90 days') + ' </b></p>';
								} else if (self.isCumulative120) {
									return '<div id="circle" style="height=20px; width=20px;" ><a style="font-size: 20px; color: #1e90ff; " > &#x25CF;</a><b>' + dataPoint + '</b></div><p>' + d.data.key + '<b>  ' + d.data.y + ' ' + self.changeMeasurementUnitForAmplitudeBar(isRainfallShow, 'mm/120 days') + ' </b></p>';
								} else {
									return '<div id="circle" style="height=20px; width=20px;" ><a style="font-size: 20px; color: #1e90ff; " > &#x25CF;</a><b>' + dataPoint + '</b></div><p>' + d.data.key + '<b>  ' + d.data.y + ' ' + self.changeMeasurementUnitForAmplitudeBar(isRainfallShow, 'mm') + ' </b></p>';
								}
							}
						},
						"noData": "Loading...",
						"showLegend": false
					},
					"title": {
						"enable": true,
						"text": "",
						"html": "Loading"
					},
					"subtitle": {
						"enable": false
					},
					"caption": {
						"enable": false
					}
				},
				"changeMeasurementUnitForAmplitudeBar": function (isRainfallShow, originalUnit) {
					if (isRainfallShow) {
						return originalUnit;
					} else {
						return 'dB';
					}
				},
				"comboboxModel": null,
				"comboboxSecondMeasurement": null,
				"checkboxModelRegression": null,
				"checkboxModelErrorFilter": true,
				"checkboxModelView": false,
				"measureFound": true,
				"chartDataMeasureCount": false, //flag to download weather only one time.
				"chartData": [],
				"ps": [],
				"psCandidate": [],
				"checkboxModel2": ['Daily', 'Cumulative 30 day', 'Cumulative 60 day', 'Cumulative 90 day', 'Cumulative 120 day'],
				"isRegressiveActivated": false,
				"isFilterErrorActivated": true,
				"isFilterAmplitudeActivated": false,
				"coherence": 0,
				"coherence_norm": 0,
				"viewPrecipitation": true,
				"rainSelectItems": [
					{
						"label": 'precipitationsDailyPsTrend',
						"value": "daily"
					},
					{
						"label": 'precipitations30PsTrend',
						"value": "cumulative30"
					},
					{
						"label": 'precipitations60PsTrend',
						"value": "cumulative60"
					},
					{
						"label": 'precipitations90PsTrend',
						"value": "cumulative90"
					},
					{
						"label": 'precipitations120PsTrend',
						"value": "cumulative120"
					}
				],
				"currentSecondMeasurementItems": [
					{
						"label": 'precipitationsNonePsTrend',
						"value": "none"
					},
					{
						"label": 'precipitationsPsTrend',
						"value": "rainfall"
					},
					{
						"label": 'amplitudePsTrend',
						"value": "amplitude"
					},
				],
				"secondMeasurementItems": [
					{
						"label": 'precipitationsNonePsTrend',
						"value": "none",
						"active": true
					},
					{
						"label": 'precipitationsPsTrend',
						"value": "rainfall",
						"active": true
					},
					{
						"label": 'amplitudePsTrend',
						"value": "amplitude",
						"active": true
					},
				],
				"isCumulative30": true,
				"isCumulative60": false,
				"isCumulative90": false,
				"isCumulative120": false,
				"yearCumulativeWeather": 0,
				"stringPeriod": "",
				"lastDatePs": 0,
				"firstDatePs": 0,
				"maxVelPs": 0,
				"minVelPs": 0,
				"psLength": 0,
				"psTempLength": 0,
				"lat": 0,
				"lon": 0,
				"data": [], // PS line chart data
				"databkp": [], // PS line chart data backup for speed refresh
				"databkpCount": [], // PS line chart index backup for speed refresh
				"psDetails": [], // PS feature details
				"show_trends": false, // dialog box closure
				"showPsTrends": function (show) { // showPsTrends hides this view and deletes OLs marker
					self.show_trends = show;
					if (!show) {
						self.data = [];
						self.psDetails = [];
					}
				},
				"hideMarker": function () {
					$rootScope.markerVisibility = false;
				},
				"setRegressionView": function () {
					self.isRegressiveActivated = !self.isRegressiveActivated;
					if (self.psLength === 1 && self.isRegressiveActivated) {
						//minimi quadrati per la retta di interpolazione
						var values = [];
						var x = 0, y = 0, x2 = 0, y2 = 0, xy = 0;
						var coeff = 0, q = 0;
						var i = 0;
						for (i = 0; i < self.data[0].values.length; i++) {
							x += new Date(self.data[0].values[i].x).getTime();
							y += self.data[0].values[i].y;
							x2 += (self.data[0].values[i].x.getTime() * self.data[0].values[i].x.getTime());
							y2 += (self.data[0].values[i].y * self.data[0].values[i].y);
							xy += (self.data[0].values[i].x.getTime() * self.data[0].values[i].y);

						}
						x = x / self.data[0].values.length;
						y = y / self.data[0].values.length;
						x2 = x2 / self.data[0].values.length;
						y2 = y2 / self.data[0].values.length;
						xy = xy / self.data[0].values.length;
						coeff = (xy - (x * y)) / (x2 - (x * x));
						q = y - (coeff * x);
						var firstY = coeff * self.data[0].values[0].x + q;
						var lastY = coeff * self.data[0].values[self.data[0].values.length - 1].x + q;
						if (self.isRegressiveActivated) {
							values.push({
								"x": self.data[0].values[0].x,
								"y": Math.round(firstY * 100) / 100,
								"key": "Interpolation"
							});
							values.push({
								"x": self.data[0].values[self.data[0].values.length - 1].x,
								"y": Math.round(lastY * 100) / 100,
								"key": "Interpolation"
							});
							var interpX = self.data[0].values[0].x;
							while (interpX < self.data[0].values[self.data[0].values.length - 1].x) {
								var interpY = coeff * interpX + q;
								values.push({
									"x": interpX,
									"y": Math.round(interpY * 100) / 100,
									"key": "Interpolation"
								});
								interpX = d3.time.month.offset(interpX, 6);
							}
							self.chartData.push({
								"key": "InterPolation",
								"values": values,
								"color": "#00cc00"
							});
						}
					} else {
						for (var j = 0; j < self.data.length; j++) {
							if (self.data[j].key === "InterPolation") {
								self.data.splice(j, 1);
							}
						}
					}
					//generateChartData(self.ps);
				},
				"filterErrorView": function () {
					self.isFilterErrorActivated = !self.isFilterErrorActivated;
					if (self.psLength === 1 && self.isFilterErrorActivated) {
						//minimi quadrati per la retta di interpolazione
						self.databkp = [];
						self.databkpCount = [];
						var x = 0, y = 0, x2 = 0, y2 = 0, xy = 0;
						var coeff = 0, q = 0;
						var i = 0;
						for (i = 0; i < self.data[0].values.length; i++) {
							x += new Date(self.data[0].values[i].x).getTime();
							y += self.data[0].values[i].y;
							x2 += (self.data[0].values[i].x.getTime() * self.data[0].values[i].x.getTime());
							y2 += (self.data[0].values[i].y * self.data[0].values[i].y);
							xy += (self.data[0].values[i].x.getTime() * self.data[0].values[i].y);

						}
						x = x / self.data[0].values.length;
						y = y / self.data[0].values.length;
						x2 = x2 / self.data[0].values.length;
						y2 = y2 / self.data[0].values.length;
						xy = xy / self.data[0].values.length;
						coeff = (xy - (x * y)) / (x2 - (x * x));
						q = y - (coeff * x);
						var yaxisLinear;
						var thresold = 2 * Math.sqrt(Math.log(self.coherence));
						//console.log(thresold);
						for (var c = 0; c < self.data[0].values.length; c++) {
							yaxisLinear = coeff * self.data[0].values[c].x + q;
							if (Math.abs((yaxisLinear - self.data[0].values[c].y)) > thresold) {
								//console.log(self.data[0].values[c]);
								self.databkp.push(self.data[0].values[c]);
								self.databkpCount.push(c);
								self.data[0].values.splice(c, 1);

							}
						}

					} else {
						var j = 0;
						for (var k = 0; k < self.databkp.length; k++) {

							//console.log(self.databkpCount[k]);
							//console.log(self.databkp[k]);
							self.data[0].values.splice(self.databkpCount[k] + j, 0, self.databkp[k]);
							j++;
						}

					}
					//generateChartData(self.ps);
				},
				"filterAmplitudeView": function () {
					for (var i = 0; i < self.data.length; i++) {
						if (self.data[i].key === "SecondMeasurements") {
							self.data.splice(i, 1);
						}
					}
					self.options.chart.y1Axis.axisLabel = $translate.instant('y1Axis.axisLabelAmplitude');
					self.chartData.push({
						"key": "SecondMeasurements",
						"values": amplitudes,
						"color": "#50507c",
						"bar": true
					});
					if (brushExtent.length != 0) {
						self.options.chart.brushExtent = brushExtent;
					}
					self.api.refresh();
				},
				"changeSecondMeasurement": function (comboboxSecondMeasurement) {
					if (comboboxSecondMeasurement.value === 'none') {
						self.options.chart.y1Axis.axisLabel = "";
						for (var j = 0; j < self.data.length; j++) {
							if (self.data[j].key === "SecondMeasurements") {
								self.data.splice(j, 1);
							}
						}
						$rootScope.lastInfo = 'none';
						self.isFilterAmplitudeActivated = false;
					} else if (comboboxSecondMeasurement.value === 'rainfall') {
						self.changeCumulativeView(self.comboboxModel);
						self.isFilterAmplitudeActivated = false;
						$rootScope.lastInfo = 'rainfall';
					} else if (comboboxSecondMeasurement.value === 'amplitude') {
						self.isFilterAmplitudeActivated = true;
						$rootScope.lastInfo = 'amplitude';
						self.filterAmplitudeView();
					}
				},
				"changeCumulativeView": function (comboboxModel) {
					if (comboboxModel.value === 'daily') {
						//self.viewPrecipitation=true;
						self.options.chart.y1Axis.axisLabel = $translate.instant('y1Axis.axisLabelRainfall');
						self.isCumulative30 = false;
						self.isCumulative60 = false;
						self.isCumulative90 = false;
						self.isCumulative120 = false;
					} else if (comboboxModel.value === 'cumulative30') {
						//self.viewPrecipitation=true;
						self.options.chart.y1Axis.axisLabel = $translate.instant('y1Axis.axisLabelRainfall');
						self.isCumulative30 = true;
						self.isCumulative60 = false;
						self.isCumulative90 = false;
						self.isCumulative120 = false;
					} else if (comboboxModel.value === 'cumulative60') {
						//self.viewPrecipitation=true;
						self.options.chart.y1Axis.axisLabel = $translate.instant('y1Axis.axisLabelRainfall');
						self.isCumulative30 = false;
						self.isCumulative60 = true;
						self.isCumulative90 = false;
						self.isCumulative120 = false;
					} else if (comboboxModel.value === 'cumulative90') {
						//self.viewPrecipitation=true;
						self.options.chart.y1Axis.axisLabel = $translate.instant('y1Axis.axisLabelRainfall');
						self.isCumulative30 = false;
						self.isCumulative60 = false;
						self.isCumulative90 = true;
						self.isCumulative120 = false;
					} else if (comboboxModel.value === 'cumulative120') {
						//self.viewPrecipitation=true;
						self.options.chart.y1Axis.axisLabel = $translate.instant('y1Axis.axisLabelRainfall');
						self.isCumulative30 = false;
						self.isCumulative60 = false;
						self.isCumulative90 = false;
						self.isCumulative120 = true;
					}

					for (var i = 0; i < self.data.length; i++) {
						if (self.data[i].key === "SecondMeasurements") {
							self.data.splice(i, 1);
						}
					}

					var values = getWeather(); // get weather data
					self.chartData.push({
						"key": "SecondMeasurements",
						//"yAxis" : 2,
						"bar": true,
						"values": values,
						"color": "#67C8FF"
					});
					if (brushExtent.length != 0) {
						self.options.chart.brushExtent = brushExtent;
					}
				}
			});

			$rootScope.$on('$translateChangeSuccess', function () {
				self.options.chart.xAxis.axisLabel = $translate.instant('xAxis.axisLabel');
				self.options.chart.y2Axis.axisLabel = $translate.instant('y2Axis.axisLabel');
				switch (self.comboboxSecondMeasurement.value) {
					case 'none':
						self.options.chart.y1Axis.axisLabel = "";
						break;
					case 'rainfall':
						self.options.chart.y1Axis.axisLabel = $translate.instant('y1Axis.axisLabelRainfall');
						break;
					case 'amplitude':
						self.options.chart.y1Axis.axisLabel = $translate.instant('y1Axis.axisLabelAmplitude');
						break;
				}
			});

			$scope.$on("setPsTrendsClosure", function (e) { // jshint ignore:line
				if (self.show_trends) {
					self.showPsTrends(false);
				}
			});

			/**
			 * Opens PsTrends Panel after broadcast event
			 */
			$scope.$on("openPsTrends", function (e, data) { // jshint ignore:line
				$scope.mapsIds.forEach(function(mapId){
					olData.getMap(mapId).then(function(map){
						var coordinate = ol.proj.fromLonLat(data);
						map.dispatchEvent({
							type: 'singleclick',
							coordinate: coordinate
						});
					});
				});
			});

			/**
			 * WATCHERS
			 */
			$scope.$watch("psCandidate", function (psCandidate) {
				if (psCandidate && (psCandidate !== null) && (psCandidate.features !== null) && (psCandidate.features.length > 0)) {
					console.log("psCandidate")
					self.psCandidate = psCandidate;
					self.showPsTrends(
						generateChartDataCandidate(psCandidate)
					);
				} else {
					self.showPsTrends(false);
				}
				Flash.dismiss();
			});

			// ps watcher for rendering chart line data
			$scope.$watch("ps", function (ps) {
				if ((ps !== null) && (ps.features !== null) && (ps.features.length > 0)) {
					console.log("ps")
					self.ps = ps;
					self.showPsTrends(
						generateChartData(ps)
					);

				} else {
					self.showPsTrends(false);
				}
				Flash.dismiss();
			});

			var calculateRegressionLine = function () {
				if (self.psLength === 1 && self.isRegressiveActivated) {
					//minimi quadrati per la retta di interpolazione
					var values = [];
					var x = 0, y = 0, x2 = 0, y2 = 0, xy = 0;
					var coeff = 0, q = 0;
					var i = 0;
					for (i = 0; i < self.data[0].values.length; i++) {
						x += new Date(self.data[0].values[i].x).getTime();
						y += self.data[0].values[i].y;
						x2 += (self.data[0].values[i].x.getTime() * self.data[0].values[i].x.getTime());
						y2 += (self.data[0].values[i].y * self.data[0].values[i].y);
						xy += (self.data[0].values[i].x.getTime() * self.data[0].values[i].y);

					}
					x = x / self.data[0].values.length;
					y = y / self.data[0].values.length;
					x2 = x2 / self.data[0].values.length;
					y2 = y2 / self.data[0].values.length;
					xy = xy / self.data[0].values.length;
					coeff = (xy - (x * y)) / (x2 - (x * x));
					q = y - (coeff * x);
					var firstY = coeff * self.data[0].values[0].x + q;
					var lastY = coeff * self.data[0].values[self.data[0].values.length - 1].x + q;
					if (self.isRegressiveActivated) {
						values.push({
							"x": self.data[0].values[0].x,
							"y": Math.round(firstY * 100) / 100,
							"key": "Interpolation"
						});
						values.push({
							"x": self.data[0].values[self.data[0].values.length - 1].x,
							"y": Math.round(lastY * 100) / 100,
							"key": "Interpolation"
						});
						var interpX = self.data[0].values[0].x;
						while (interpX < self.data[0].values[self.data[0].values.length - 1].x) {
							var interpY = coeff * interpX + q;
							values.push({
								"x": interpX,
								"y": Math.round(interpY * 100) / 100,
								"key": "Interpolation"
							});
							interpX = d3.time.month.offset(interpX, 6);
						}
						self.chartData.push({
							"key": "InterPolation",
							"values": values,
							"color": "#00cc00"
						});
					}
				}
			};

			var useNoiseFilter = function () {
				//console.log(self.isFilterErrorActivated);
				if (self.psLength === 1 && self.isFilterErrorActivated) {
					//minimi quadrati per la retta di interpolazione
					self.databkp = [];
					self.databkpCount = [];
					var x = 0, y = 0, x2 = 0, y2 = 0, xy = 0;
					var coeff = 0, q = 0;
					var i = 0;
					for (i = 0; i < self.data[0].values.length; i++) {
						x += new Date(self.data[0].values[i].x).getTime();
						y += self.data[0].values[i].y;
						x2 += (self.data[0].values[i].x.getTime() * self.data[0].values[i].x.getTime());
						y2 += (self.data[0].values[i].y * self.data[0].values[i].y);
						xy += (self.data[0].values[i].x.getTime() * self.data[0].values[i].y);
					}
					x = x / self.data[0].values.length;
					y = y / self.data[0].values.length;
					x2 = x2 / self.data[0].values.length;
					y2 = y2 / self.data[0].values.length;
					xy = xy / self.data[0].values.length;
					coeff = (xy - (x * y)) / (x2 - (x * x));
					q = y - (coeff * x);
					var yaxisLinear;
					var thresold = 2 * Math.sqrt(Math.log(self.coherence));
					//console.log(thresold);
					for (var c = 0; c < self.data[0].values.length; c++) {
						yaxisLinear = coeff * self.data[0].values[c].x + q;
						if (Math.abs((yaxisLinear - self.data[0].values[c].y)) > thresold) {
							//console.log(self.data[0].values[c]);
							self.databkp.push(self.data[0].values[c]);
							self.databkpCount.push(c);
							self.data[0].values.splice(c, 1);
						}
					}
				}

			};

			var setTitle = function (response, scattererId) {
				document.getElementById("featureinfo_" + scattererId).title = response;
				document.getElementById("featureinfo_" + scattererId).alt = response;
			};

			var setCropTitle = function (crop, featureInfo) {
				var scattererId = featureInfo.scattererId;
				var scattererCode = featureInfo.scattererCode;
				var scattererType = featureInfo.scattererType

				var r = "";
				var cropParameter = _.find(crop.crop_parameters, ['type', scattererType]);
				var metadata_timestamp = "";
				if (cropParameter.metadata) {
					var metadata = JSON.parse(cropParameter.metadata);
					if (metadata.hasOwnProperty("algorithm")) {
						r += "Algorithm Name: " + metadata.algorithm.name + "\n" +
							"Algorithm Description: " + metadata.algorithm.description + "\n";
					}
					metadata_timestamp = "\n"+"Timestamp Elaboration Start: "
						+ metadata.processor_output_metadata.processing_time.start + "\n" +
						"Timestamp Elaboration End: " + metadata.processor_output_metadata.processing_time.end;
				} else {
					metadata_timestamp = "\n";
				}
				r += "Scatterer Code: " + scattererId + "\n" +
					"Supermaster: " + featureInfo.supermasterUid + "\n" +
					"Swath: " + featureInfo.beamId + "\n" +
					"Crop ID: " + crop.code + "\n" +
					"PS Code: " + scattererCode + metadata_timestamp
				setTitle(r, scattererId);
			};

			/**
			 * Parameters:
			 * features - {Object}
			 *
			 * Returns:
			 */
			var generateChartData = function (ps) {
				self.options.chart.noData = "Loading ...";
				self.chartDataMeasureCount = false; // reset flag for download weather
				self.currentWeather = [];
				self.data = [];
				self.maxVelPs = -100;
				self.minVelPs = 100;
				self.lat = ps.point[1];
				self.lon = ps.point[0];
				var res = false;
				self.options.title.html = "";
				var deals = $scope.getUserDeals(); // get user contracts
				var point = [Math.round(self.lon * 10000) / 10000, Math.round(self.lat * 10000) / 10000];
				//console.log("Total deals for selected point: ",deals.length);
				//console.log("Deals for selected point: ",deals);
				if (deals.length > 0) {// if exists at least one contract in the selected point
					try {//get contracts start&end period
						//console.log("filter contracts for this point: ",point);
						self.stringPeriod = "";
						var totalContract = 0;
						for (var d = 0; d < deals.length; d++) {
							if (inside(point, deals[d].geom_geo_json.coordinates[0])) {
								self.firstDatePs = new Date(deals[d].end_period).getTime();
								self.lastDatePs = 0;
								totalContract++;
								self.stringPeriod += d3.time.format("%Y-%m-%d")(new Date(deals[d].start_period)) + "," + d3.time.format("%Y-%m-%d")(new Date()) + ";"; // jshint ignore:line
								if (new Date(deals[d].end_period).getTime() < new Date().getTime()) {
									self.stringPeriod += d3.time.format("%Y-%m-%d")(new Date(deals[d].start_period)) + "," + d3.time.format("%Y-%m-%d")(new Date(deals[d].end_period)) + ";"; // jshint ignore:line
								}
							}
						}
						//console.log("Show period contracts in the selected point:",self.stringPeriod);

						getCity();  // get city info from Nomimatim and save in titleChart
						self.chartData = []; // Data is represented as an array of {x,y} pairs.
						var tableInfo = []; // PS details
						var scattererIdParamKey = configuration.rheticusAPI.measure.properties.scattererId;

						// RICORDA DI IMPLEMENTARE ANCHE IL CONTROLLO CON I CONTRATTI
						if ($scope.getVelocityField() === "velocity" || $scope.getVelocityField() === "velocity_prev") {
							self.stringPeriod = self.stringPeriod.substring(0, self.stringPeriod.length - 1);
						}
						for (var i = 0; i < ps.features.length; i++) {
							self.psLength = ps.features.length;
							self.psTempLength = 0;
							if (ps.features[i].properties) {
								var scattererId = eval("ps.features[i].properties." + scattererIdParamKey + ";"); // jshint ignore:line
								self.chartData.push({
									"key": ps.features[i].id,
									"values": getMeasures(scattererId, tableInfo, ps.features[i].properties, self.options.chart.color[i]) // values - represents the array of {x,y} data points
								});

							}
						}


						//Line chart data should be sent as an array of series objects.
						self.psDetails = tableInfo;
						if (!$scope.$$phase) {
							$scope.$apply();

						}
						res = true;
					} catch (e) {
						console.log("[ps-trends-controller :: generateChartData] EXCEPTION : '" + e);
					} finally {
						// do nothing
						return (res);
					}
				} else {
					return false;				// To do: notification to alert user.
				}

			};

			function updateScattererTableEntry(tableInfo, featureProperties, scatterer, color) {
				if (featureProperties.scatterer_type === 'PS' && scatterer.ps !== undefined) {
					scatterer.ps.scatterer = scatterer;
					updateTableEntry(tableInfo, featureProperties, scatterer.ps, color);
				}
				if (featureProperties.scatterer_type === 'DS' && scatterer.ds !== undefined) {
					scatterer.ds.scatterer = scatterer;
					updateTableEntry(tableInfo, featureProperties, scatterer.ds, color);
				}
				if (featureProperties.scatterer_type === 'CR' && scatterer.cr !== undefined) {
					scatterer.cr.scatterer = scatterer;
					updateTableEntry(tableInfo, featureProperties, scatterer.cr, color);
				}
			}

			function updateTableEntry(tableInfo, featureProperties, psDsProperties, color) {
				var featureInfo = {};
				featureInfo.scattererType = featureProperties.scatterer_type;
				featureInfo.scattererCode = psDsProperties.scatterer.code;
				featureInfo.sensorName = psDsProperties.scatterer.dataset.sensor.name;
				featureInfo.supermasterUid = psDsProperties.scatterer.dataset.supermaster_uid;
				featureInfo.beamId = psDsProperties.scatterer.dataset.beam;
				featureInfo.orbit = psDsProperties.scatterer.crop.pass;
				featureInfo.height = featureProperties.height;
				featureInfo.scattererId = featureInfo.sensorName + "-" + featureInfo.supermasterUid + "-"
					+ featureInfo.beamId + "-" + featureInfo.scattererCode;
				// following two lines added to manage bookmark scatterer area
				featureInfo.scattererKey = psDsProperties.scatterer.id;

				for (var key in featureProperties) {
					if (key == "coherence") {
						featureInfo.coherence = Math.round(featureProperties.coherence * 100);
						self.coherence = featureInfo.coherence;
					} else if (key == "coherence_norm") {
						featureInfo.coherence_norm = Math.round(featureProperties.coherence_norm * 100);
						self.coherence_norm = featureInfo.coherence_norm;
					} else if ($rootScope.period == "g" && key == "g_v") {
						featureInfo.velocity = Math.round(featureProperties.g_v * 10) / 10;
					} else if ($rootScope.period == "g" && key == "g_a") {
						featureInfo.acceleration = Math.round(featureProperties.g_a * 10) / 10;
					} else if ($rootScope.period == "ly" && key == "ly_v") {
						featureInfo.velocity = Math.round(featureProperties.ly_v * 10) / 10;
					} else if ($rootScope.period == "ly" && key == "ly_a") {
						featureInfo.acceleration = Math.round(featureProperties.ly_a * 10) / 10;
					} /*else {
						eval("featureInfo." + key + " = ps.features[\"" + i + "\"].properties." + key + ";"); // jshint ignore:line
					}*/
				}

				if ($scope.getVelocityField() === "velocity" || $scope.getVelocityField() === "velocity_prev") {
					featureInfo.velocity = featureProperties.velocity;
				}
				featureInfo.color = color;
				tableInfo.push(featureInfo);
				setTimeout(function () {
					setCropTitle(psDsProperties.scatterer.crop, featureInfo);
				}, 1000);
			}

			/**
			 * Check if a point belogs to a polygon.
			 * Parameters:
			 * features - {point,array of point}
			 *
			 * Returns: null (change the global chart title)
			 */
			function inside(point, vs) {
				var x = point[0], y = point[1];
				//console.log(point);
				//console.log(vs);
				var isInside = false;
				for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
					var xi = vs[i][0], yi = vs[i][1];
					var xj = vs[j][0], yj = vs[j][1];
					var intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
					if (intersect) {
						isInside = !isInside;
					}
				}
				//console.log(isInside);
				return isInside;
			}

			/**
			 * PRIVATE  VARIABLES AND METHODS
			 */
			var getMeasureUrl = host + configuration.rheticusAPI.measure.path;
			var scattererIdKey = configuration.rheticusAPI.measure.scattererId;
			var periodsKey = configuration.rheticusAPI.measure.periods;

			var getMeasures = function (scattererId, tableInfo, featureProperties, color) {
				var ret = [];
				// set the url with global period
				var url = getMeasureUrl
					.replace(scattererIdKey, scattererId)
					.replace(periodsKey, self.stringPeriod);

				$http.get(url)
					.success(function (httpResponse) { //if request is successful
						if (self.comboboxSecondMeasurement == null) {
							self.comboboxSecondMeasurement = self.secondMeasurementItems[1];
						}
						var scatterer = httpResponse.data;

						updateScattererTableEntry(tableInfo, featureProperties, scatterer, color);

						var measures = {};
						if (featureProperties.scatterer_type === 'PS' && scatterer.ps !== undefined) {
							measures = JSON.parse(scatterer.ps.ps_measurement_entity.measurement);
						} else if (featureProperties.scatterer_type === 'DS' && scatterer.ds !== undefined) {
							measures = JSON.parse(scatterer.ds.ds_measurement_entity.measurement);
						} else if (featureProperties.scatterer_type === 'CR' && scatterer.cr !== undefined) {
							measures = JSON.parse(scatterer.cr.cr_measurement_entity.measurement);
						}
						amplitudes = [];

						var dateParamKey = configuration.rheticusAPI.measure.properties.date;
						var measureParamKey = configuration.rheticusAPI.measure.properties.measure;
						var amplitudeParamKey = configuration.rheticusAPI.measure.properties.amplitude;
						if ((measures !== null) && measures.length > 0) {
							for (var i = 0; i < measures.length; i++) {
								var y = parseInt(measures[i].d.substring(0, 4));
								var m = parseInt(measures[i].d.substring(4, 6)) - 1;
								var d = parseInt(measures[i].d.substring(6, 8));
								var measureDate = new Date(y, m, d);
								amplitudes.push({
									"key": $translate.instant('amplitudePsTrend'),
									"x": measureDate,
									"y": measures[i].a
								});

								if (measures[i].a < self.minAmplPs) {
									self.minAmplPs = measures[i].a;
								}
								if (measures[i].a > self.maxAmplPs) {
									self.maxAmplPs = measures[i].a;
								}
								//var measureDate = new Date(eval("measures[i]."+dateParamKey+";")); // jshint ignore:line
								if (measures[i].m < self.minVelPs) {
									self.minVelPs = measures[i].m;
								}
								if (measures[i].m > self.maxVelPs) {
									self.maxVelPs = measures[i].m;
								}

								if (measureDate instanceof Date) {
									var milliTime = measureDate.getTime();
									if (self.lastDatePs < milliTime) {				//update last valid date for PS
										self.lastDatePs = milliTime;
									}
									if (self.firstDatePs > milliTime) {
										self.firstDatePs = milliTime;
									}
									//this array appears in PSTREND tooltip.
									ret.push({
										"x": measureDate,
										"y": eval("measures[i]." + measureParamKey + ";"), // jshint ignore:line
										"key": featureProperties.scatterer_type + " - " + scatterer.code
									});
								}
							}

							var resetGraphSelector = true;
							psRequestIndex++;
							if(psRequestIndex == self.psLength){
								psRequestIndex = 0;
								if ($rootScope.period == "g") {
									if (oldPeriod != '' && oldPeriod != $rootScope.period) {
										brushExtent = [];
										resetGraphSelector = true;
									} else if (brushExtent.length == 0) {
										resetGraphSelector = true;
									} else if (brushExtent[0] < self.firstDatePs || brushExtent[1] > self.lastDatePs){
										resetGraphSelector = true;
									} else if (oldFirstDatePs != 0 && oldLastDatePs != 0 && (oldFirstDatePs != self.firstDatePs || oldLastDatePs != self.lastDatePs)){
										resetGraphSelector = true;
									} else {
										resetGraphSelector = false;
									}
									oldPeriod = 'g';
									if (!resetGraphSelector) {
										self.options.chart.brushExtent = brushExtent;
									} else {
										self.options.chart.brushExtent = [self.firstDatePs, self.lastDatePs];
									}
								} else if ($rootScope.period == "ly") {
									oldPeriod = 'ly';
									self.options.chart.brushExtent = [self.lastDatePs - 31536000000, self.lastDatePs];
								}

								oldFirstDatePs = self.firstDatePs;
								oldLastDatePs = self.lastDatePs;
							}

							self.psTempLength++;
							self.measureFound = true;
							updateyDomain1();
						}
						if (!self.chartDataMeasureCount && measures.length > 0 && self.comboboxSecondMeasurement.value === 'rainfall') {
							var values = getWeather(); // get weather data					
							self.chartData.push({
								"key": "SecondMeasurements",
								"bar": true,
								"values": values,
								"color": "#67C8FF"
							});
							self.chartDataMeasureCount = true;
						} else if (measures.length === 0) {
							self.options.chart.noData = "Your subscription does not include this point.";
							self.checkboxModelView = false;
							self.measureFound = false;
						}
						if (!self.chartDataMeasureCount && measures.length > 0 && self.comboboxSecondMeasurement.value === 'amplitude' && self.isFilterAmplitudeActivated) {
							self.chartData.push({
								"key": "SecondMeasurements",
								"bar": true,
								"values": amplitudes,
								"color": "#50507c"
							});
						}
					})
					.error(function (error) { //.error(function(data,status,headers,config){ //if request is not successful
						console.log("[ps-trends-controller] getMeasures :: ERROR");
					});
				return ret;
			};

			var updateyDomain1 = function () {
				if (self.psTempLength === self.psLength) {
					//console.log("lunghezza temp ps",self.psTempLength);
					var delta = Math.abs(self.maxVelPs - self.minVelPs);
					//console.log("delta",delta);
					if (delta < 20) {
						self.options.chart.lines.yDomain = [self.minVelPs - (20 - delta) / 2, self.maxVelPs + (20 - delta) / 2];
						self.options.chart.y2Axis.showMaxMin = false;
						//	console.log("added",self.options.chart.yDomain1);
					} else {
						self.options.chart.lines.yDomain = [self.minVelPs, self.maxVelPs];
						self.options.chart.y2Axis.showMaxMin = true;
						//	console.log("normal",self.options.chart.yDomain1);
					}
					self.data = self.chartData;
					if (self.psLength === 1) {
						self.checkboxModelView = true;
						for (var i = 0; i < self.secondMeasurementItems.length; i++) {
							if (self.secondMeasurementItems[i].value === "amplitude") {
								self.secondMeasurementItems[i].active = true;
								break;
							}
						}
						if (self.isFilterAmplitudeActivated || $rootScope.lastInfo == 'amplitude') {
							self.comboboxSecondMeasurement = self.secondMeasurementItems[2];
							self.isFilterAmplitudeActivated = true;
							$rootScope.lastInfo = 'amplitude';
						}
					} else {
						self.checkboxModelView = false;
						for (var i = 0; i < self.secondMeasurementItems.length; i++) {
							if (self.secondMeasurementItems[i].value === "amplitude") {
								self.secondMeasurementItems[i].active = false;
								break;
							}
						}
						self.isFilterAmplitudeActivated = false;
					}
					self.currentSecondMeasurementItems = [];
					for (var i = 0; i < self.secondMeasurementItems.length; i++) {
						if (self.secondMeasurementItems[i].active) {
							self.currentSecondMeasurementItems.push(self.secondMeasurementItems[i]);
						}
					}
					calculateRegressionLine();
					useNoiseFilter();
				} else {
					if (self.isFilterAmplitudeActivated) {
						self.isFilterAmplitudeActivated = false;
						self.comboboxSecondMeasurement = self.secondMeasurementItems[0];
					}
				}
			};
			var getCity = function () {
				GeocodingService.reverse(
					{ "lon": self.lon, "lat": self.lat },
					getCityCallback
				);
			};

			var getCityCallback = function (result) {
				self.options.title.html = result + " [LAT: " + Math.round(self.lat * 10000) / 10000 + "; LON: " + Math.round(self.lon * 10000) / 10000 + "]";
			};

			/**
			 * Parameters:
			 *
			 * Returns: array values with the date and the relative measure
			 */
			var getWeather = function () {
				var values = [];
				var currentWeatherValue = 0;
				var currentWeatherValue30 = 0;
				var currentWeatherValue60 = 0;
				var currentWeatherValue90 = 0;
				var currentWeatherValue120 = 0;
				var getStationIdUrl = host + configuration.rheticusAPI.weather.getStationId.path;
				var latKey = configuration.rheticusAPI.weather.getStationId.lat;
				var lonKey = configuration.rheticusAPI.weather.getStationId.lon;
				var url1 = getStationIdUrl
					.replace(latKey, self.lat)
					.replace(lonKey, self.lon);
				self.options.chart.y1Axis.axisLabel = $translate.instant('y1Axis.axisLabelRainfall');
				$http.get(url1)
					.success(function (httpResponse) {
						var response = httpResponse.data;
						if (response.length == 0) {
							self.viewPrecipitation = false;
							self.options.chart.y1Axis.axisLabel = "";
							self.api.refresh();
						} else {
							var station = response[0].id;
							var lastDatePs = d3.time.format("%Y-%m-%d")(new Date(self.lastDatePs)); // jshint ignore:line
							var firstDatePs = d3.time.format("%Y-%m-%d")(new Date(self.firstDatePs)); // jshint ignore:line
							var getWeatherMeasuresByStationIdUrl = host + configuration.rheticusAPI.weather.getWeatherMeasuresByStationId.path;
							var stationidKey = configuration.rheticusAPI.weather.getWeatherMeasuresByStationId.stationid;
							var begindateKey = configuration.rheticusAPI.weather.getWeatherMeasuresByStationId.begindate;
							var enddateKey = configuration.rheticusAPI.weather.getWeatherMeasuresByStationId.enddate;
							var url2 = getWeatherMeasuresByStationIdUrl
								.replace(stationidKey, station)
								.replace(begindateKey, firstDatePs)
								.replace(enddateKey, lastDatePs);
							$http.get(url2)
								.success(function (httpResponse) {
									var response = httpResponse.data;
									if (response.length == 0) {
										self.viewPrecipitation = false;
										self.options.chart.y1Axis.axisLabel = "";
										self.api.refresh();
										return;
									}
									var j = 0;
									for (var i = 0; i < response.length; i++) {
										var y = parseInt(response[i].data.substring(0, 4));
										var m = parseInt(response[i].data.substring(5, 7)) - 1;
										var d = parseInt(response[i].data.substring(8, 10));
										var dateWeather = new Date(y, m, d);
										currentWeatherValue += Math.round(response[i].measure);
										var found = self.chartData[0].values.find(function (data) {
											return data.x.getTime() === dateWeather.getTime();
										});
										if (found) {
											if (self.isCumulative30) {
												if (i < 30) {
													values.push({
														"key": $translate.instant('precipitationsPsTrend'),
														"x": dateWeather,
														"y": currentWeatherValue
													});
													//console.log(currentWeatherValue);
												} else {
													currentWeatherValue30 = 0;
													for (j = i; j > i - 30; j--) {
														currentWeatherValue30 += Math.round(response[j].measure);
													}
													//console.log(currentWeatherValue30);
													values.push({
														"key": $translate.instant('precipitationsPsTrend'),
														"x": dateWeather,
														"y": currentWeatherValue30
													});
												}

											} else if (self.isCumulative60) {
												if (i < 60) {
													values.push({
														"key": $translate.instant('precipitationsPsTrend'),
														"x": dateWeather,
														"y": currentWeatherValue
													});
													//console.log(currentWeatherValue);
												} else {
													currentWeatherValue60 = 0;
													for (j = i; j > i - 60; j--) {
														currentWeatherValue60 += Math.round(response[j].measure);
													}
													//console.log(currentWeatherValue60);
													values.push({
														"key": $translate.instant('precipitationsPsTrend'),
														"x": dateWeather,
														"y": currentWeatherValue60
													});
												}
											} else if (self.isCumulative90) {
												if (i < 90) {
													values.push({
														"key": $translate.instant('precipitationsPsTrend'),
														"x": dateWeather,
														"y": currentWeatherValue
													});
													//console.log(currentWeatherValue);
												} else {
													currentWeatherValue90 = 0;
													for (j = i; j > i - 90; j--) {
														currentWeatherValue90 += Math.round(response[j].measure);
													}
													//console.log(currentWeatherValue90);
													values.push({
														"key": $translate.instant('precipitationsPsTrend'),
														"x": dateWeather,
														"y": currentWeatherValue90
													});
												}
											} else if (self.isCumulative120) {
												if (i < 120) {
													values.push({
														"key": $translate.instant('precipitationsPsTrend'),
														"x": dateWeather,
														"y": currentWeatherValue
													});
													//console.log(currentWeatherValue);
												} else {
													currentWeatherValue120 = 0;
													for (j = i; j > i - 120; j--) {
														currentWeatherValue120 += Math.round(response[j].measure);
													}
													//console.log(currentWeatherValue120);
													values.push({
														"key": $translate.instant('precipitationsPsTrend'),
														"x": dateWeather,
														"y": currentWeatherValue120
													});
												}
											} else {
												values.push({
													"key": $translate.instant('precipitationsPsTrend'),
													"x": dateWeather,
													"y": response[i].measure
												});
											}
										}
									}
									self.chartData[0].values.forEach(function (value) {
										var found = values.find(function (singleValue) {
											return value.x.getTime() === singleValue.x.getTime()
										});
										if (!found) {
											values.push({
												"key": $translate.instant('precipitationsPsTrend'),
												"x": value.x,
												"y": undefined
											});
										}
									});
									// adding dummy weather values in order to focus correctly
									var dummyWeatherDate = new Date(response[response.length - 1].data);
									var lastDate = new Date(lastDatePs);
									while (dummyWeatherDate < lastDate) {
										//console.log(dummyWeatherDate);
										values.push({
											"key": $translate.instant('precipitationsPsTrend'),
											"x": dummyWeatherDate,
											"y": undefined
										});
										dummyWeatherDate = new Date(dummyWeatherDate);
										dummyWeatherDate.setDate(dummyWeatherDate.getDate() + 1);
									}
								})
								.error(function (response) { // jshint ignore:line
									//HTTP STATUS != 200
									//do nothing
								});
							self.viewPrecipitation = true;
							self.api.refresh();
						}

					})
					.error(function (response) {// jshint ignore:line
						//HTTP STATUS != 200
						//do nothing
					});

				return values;
			};

			var generateChartDataCandidate = function (psCandidate) {
				self.options.chart.noData = "Your subscription does not include this point.";
				self.checkboxModelView = false;
				self.measureFound = false;
				self.data = [];
				self.lat = psCandidate.point[1];
				self.lon = psCandidate.point[0];
				self.options.title.html = "";
				//var point = [Math.round(self.lon*10000)/10000,Math.round(self.lat*10000)/10000];
				//console.log("Total deals for selected point: ",deals.length);
				//console.log("Deals for selected point: ",deals);
				getCity();  // get city info from Nomimatim and save in titleChart
				var tableInfo = []; // PS details
				var cropidParamKey = configuration.rheticusAPI.measure.properties.cropid;
				var scattererIdParamKey = configuration.rheticusAPI.measure.properties.scattererId;

				for (var i = 0; i < psCandidate.features.length; i++) {
					self.psLength = psCandidate.features.length;
					self.psTempLength = 0;
					if (psCandidate.features[i].properties) {
						var cropId = eval("psCandidate.features[i].properties." + cropidParamKey + ";"); // jshint ignore:line

						var featureInfo = {};
						for (var key in psCandidate.features[i].properties) {
							if (key === "coherence") {
								//eval("featureInfo." + key + " = 100*psCandidate.features[\"" + i + "\"].properties." + key + ";"); // jshint ignore:line
								featureInfo.coherence = Math.round(100 * psCandidate.features[i].properties.coherence);
								self.coherence = featureInfo.coherence;
							} else if (key == "coherence_norm") {
								featureInfo.coherence_norm = Math.round(100 * psCandidate.features[i].properties.coherence_norm);
								self.coherence_norm = featureInfo.coherence_norm;
							} else {
								eval("featureInfo." + key + " = psCandidate.features[\"" + i + "\"].properties." + key + ";"); // jshint ignore:line
							}
						}
						featureInfo.color = self.options.chart.color[i];
						setCropTitle(cropId, featureInfo.scattererId, featureInfo.scattererCode, featureInfo.scattererType);
						tableInfo.push(featureInfo);
						//console.log(tableInfo);
					}


					//Line chart data should be sent as an array of series objects.
					self.psDetails = tableInfo;
					if (!$scope.$$phase) {
						$scope.$apply();
					}

				}
				return true;
			};

			/**
			 * This watch retrives existing bookmark scatterer for
			 * init the status of 'add bookmark scatterer' button
			 */
			$scope.bookmarksScattererDict = {};
			$scope.$watch("pstrends.show_trends", function (isVisible) {
				if (isVisible) {
					BookmarkScattererService.updateBookmarkScattererDict();
					$scope.bookmarksScattererDict = BookmarkScattererService.getBookmarkScattererDict();
				} else {
					$scope.bookmarksScattererDict = {};
				}
			});

			/**
			 * Methods that shows a dialog to add a Bookmark Scatterer to user list
			 * @param ev Click event on add button
			 * @param record Clicked scatterer to add to Bookmark Scatterer list
			 */
			$scope.showAddBookmarkScattererDialog = function(ev, record) {
				var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
				$mdDialog.show({
					locals: {currentRecord: record},
					controller: AddBookmarkScattererController,
					templateUrl: 'scripts/components/ps-trends/addBookmarkScatterer-dialog.tmpl.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose:true,
					fullscreen: useFullScreen
				}).then(function(answer) {
					var url = host + '/bookmarks_scatterer';
					const scattererKey =  record.scattererKey;
					const bookmarkScattererName = answer;
					var postBody = {
						'scatterer_id': scattererKey,
						'bookmark_scatterer_name': bookmarkScattererName
					};
					$http.post(url, postBody)
						.success(function (httpResponse) {
							// bookmark scatterer added
							$translate('bookmarkScattererAdded').then(function (translatedValue) {
								Flash.create("success", translatedValue);
							});
							$scope.bookmarksScattererDict[httpResponse.data.scatterer_entity.id] = true;
							$rootScope.$broadcast("reloadBookmarksScatterer");
						})
						.error(function () {
							// error adding bookmark scatterer
							$translate('bookmarkScattererNotAdded').then(function (translatedValue) {
								Flash.create("danger", translatedValue);
							});
						});
					}, function() {
					// Dialog cancelled
					});

				$scope.$watch(function() {
					return $mdMedia('xs') || $mdMedia('sm');
				}, function(wantsFullScreen) {
					$scope.customFullscreen = (wantsFullScreen === true);
				});
			};

			/**
			 * Controller of AddBookmarkScatterer dialog
			 * @param $scope Scope of the Dialog object
			 * @param $mdDialog Dialog object
			 * @param currentRecord Record to add to Bookmark Scatterer list
			 */
			function AddBookmarkScattererController($scope, $mdDialog, currentRecord) {
				$scope.newPsDsName = currentRecord.scattererCode;
				$scope.hide = function() {
					$mdDialog.hide();
				};

				$scope.cancel = function() {
					$mdDialog.cancel();
				};

				$scope.answer = function(answer) {
					$mdDialog.hide(answer);
				};
			}

			/**
			 * Set opacity of the add bookmark scatterer button to whether the releted
			 * bookmark scatterer has been added or not
			 * @param record Bookmark Scatterer to monitor
			 * @returns {{opacity: string}} Opacity value of the related button
			 */
			$scope.getAddBookmarkScattererButtonStyle = function(record) {
				if($scope.bookmarksScattererDict[record.scattererKey]){
					return {'opacity': '0.5'};
				} else {
					return {'opacity': '1'};
				}
			};
		}]);
