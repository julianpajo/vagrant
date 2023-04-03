'use strict';

/**
 * @ngdoc function
 * @name rheticus.controller:FilterPopoupCtrl
 * @description
 * # FilterPopoupCtrl
 * Filter Popoup Controller for rheticus project
 */
angular.module('rheticus')
	.controller('FilterPopoupCtrl', ['$timeout', '$rootScope', '$scope', 'configuration', '$http', '$translate', 'Flash', 'ArrayService', 'SessionService',
		function ($timeout, $rootScope, $scope, configuration, $http, $translate, Flash,ArrayService, SessionService) {

			var self = this; //this controller

			var int_form = wNumb({
				decimals: 0
			});

			angular.extend(this, {
				//warning notification
				"visibleWarning": false,
				"passDisabled":false,
				//"visibleCoherence" : true,
				//"visibleCoherenceNorm" : false,
				"showTimePeriod": true,
				//SPEED SLIDER
				"speedModelValue": $scope.speedModel.init,
				"speedOptions": {
					"start": $scope.speedModel.init,
					"range": {
						'min': $scope.speedModel.from,
						'max': $scope.speedModel.to
					},
					"step": $scope.speedModel.step,
					"dimension": $scope.speedModel.dimension,
					"pips": {
						"mode": "values",
						"density": 5,
						"values": $scope.speedModel.scale
					},
					"connect": [false, true, false],
					"behaviour": 'tap',
					"format": int_form,
					"tooltips": [int_form, int_form]
				},
				"speedEvents": {
					set: function (unencoded) {
						//console.log("NOSTRO");
						$rootScope.speedSingleShow = true;
						$scope.speedModel.init = unencoded;
						if (!$scope.$$phase) {
							$scope.$apply();
						}

					}
				},
				//COHERENCE SLIDER
				"coherenceModelValue": $scope.coherenceModel.init,
				"coherenceOptions": {
					"start": $scope.coherenceModel.init,
					"range": {
						'min': $scope.coherenceModel.from,
						'max': $scope.coherenceModel.to
					},
					"step": $scope.coherenceModel.step,
					"dimension": $scope.coherenceModel.dimension,
					"pips": {
						"mode": "values",
						"density": 5,
						"values": $scope.coherenceModel.scale
					},
					"connect": [false, true, false],
					"behaviour": 'tap',
					"format": int_form,
					"tooltips": [int_form, int_form]
				},
				"coherenceEvents": {
					set: function (unencoded) {
						$scope.coherenceModel.init = unencoded;
						if (!$scope.$$phase) {
							$scope.$apply();
						}
					}
				},
				//COHERENCE NORMALIZED SLIDER
				"coherenceNormModelValue": $scope.coherenceNormModel.init,
				"coherenceNormOptions": {
					"start": $scope.coherenceNormModel.init,
					"range": {
						'min': $scope.coherenceNormModel.from,
						'max': $scope.coherenceNormModel.to
					},
					"step": $scope.coherenceNormModel.step,
					"dimension": $scope.coherenceNormModel.dimension,
					"scale": $scope.coherenceNormModel.scale,
					"pips": {
						"mode": "values",
						"density": 5,
						"values": $scope.coherenceNormModel.scale
					},
					"connect": [false, true, false],
					"behaviour": 'tap',
					"format": int_form,
					"tooltips": [int_form, int_form]
				},
				"coherenceNormEvents": {
					set: function (unencoded) {
						$scope.coherenceNormModel.init = unencoded;
						if (!$scope.$$phase) {
							$scope.$apply();
						}
					}
				},
				//ACCELERATION SLIDER
				"accelerationModelValue": $scope.accelerationModel.init,
				"passFilterModelValue": $scope.passModel.init,
				"accelerationOptions": {
					"start": $scope.accelerationModel.init,
					"range": {
						'min': $scope.accelerationModel.from,
						'max': $scope.accelerationModel.to
					},
					"step": $scope.accelerationModel.step,
					"dimension": $scope.accelerationModel.dimension,
					"scale": $scope.accelerationModel.scale,
					"pips": {
						"mode": "values",
						"density": 5,
						"values": $scope.accelerationModel.scale
					},
					"connect": [false, true, false],
					"behaviour": 'tap',
					"format": int_form,
					"tooltips": [int_form, int_form]
				},
				"accelerationEvents": {
					set: function (unencoded) {
						$scope.accelerationModel.init = unencoded;
						if (!$scope.$$phase) {
							$scope.$apply();
						}
					}
				},
				"selectPeriod": function (period) {
					$rootScope.markerVisibility = false;
					$rootScope.period = period;
					SessionService.setData("period",period);
					$scope.setSpeedModelFilter($scope.speedModel.init);
					$scope.setCoherenceModelFilter($scope.coherenceModel.init);
					$scope.setCoherenceNormModelFilter($scope.coherenceNormModel.init);
					$scope.setAccelerationModelFilter($scope.accelerationModel.init);
					$scope.applyFiltersToMap();
				},
				"dataProviders": $scope.dataProviders, // data providers
				"updateSelection": function (position, entities) {
                    self.passDisabled = !(_.some($scope.dataProviders, function (element) {
                        return element.checked;
                    }));
					$rootScope.providersFilter = entities;
					//console.log($scope.passModel.init)
					$scope.passModel.init.A.disabled = self.passDisabled;
					$scope.passModel.init.D.disabled = self.passDisabled;
					$scope.setDataProviderFilter();
					$scope.applyFiltersToMap();
				},
				changePass: function (value) {
					$scope.passModel.init = value;
					$scope.setPassFilter(value);
					$scope.applyFiltersToMap(true);
				}
			});

			angular.extend($rootScope, {
				"normalizeCoherenceFlag": true,
				"speedSingleFlag": true,
				"speedSingleShow": false
			});

			/*
			 * WATCHERS
			*/

			$rootScope.$watch("login.details", function (user_info) {
				if (user_info && user_info.info && user_info.info.flag_period != null) {
					self.showTimePeriod = user_info.info.flag_period;
				} else {
					self.showTimePeriod = false;
				}
			});

			//Speed Single Flag
			$rootScope.$watch("speedSingleFlag", function (flag) {
				if (flag === false) {
					self.speedOptions.start.unshift(self.speedOptions.range.min);
					self.speedOptions.start.push(self.speedOptions.range.max);
					self.speedOptions.connect = [false, true, false, true, false];
					self.speedOptions.tooltips = [int_form, int_form, int_form, int_form];
				} else if (flag === true && self.speedOptions.start.length === 4) {
					self.speedOptions.start.shift();
					self.speedOptions.start.pop();
					self.speedOptions.connect = [false, true, false];
					self.speedOptions.tooltips = [int_form, int_form];
				}
			});

			//Speed set externally (i.e.: login controller)
			$scope.$watch("speedModel.init", function (value) {
				self.speedModelValue = value;
			});

			//Coherence set externally (i.e.: login controller)
			$scope.$watch("coherenceModel.init", function (value) {
				self.coherenceModelValue = value;
			});

			//Coherence Normalized set externally (i.e.: login controller)
			$scope.$watch("coherenceNormModel.init", function (value) {
				self.coherenceNormModelValue = value;
			});

			//Acceleration set externally (i.e.: login controller)
			$scope.$watch("accelerationModel.init", function (value) {
				self.accelerationModelValue = value;
			});

			$scope.$on("setDataProvidersOnFilter", function () { // jshint ignore:line
				self.dataProviders = $scope.dataProviders;
				if (!$scope.$$phase) {
					$scope.$apply();
				}
			});

		}]);
