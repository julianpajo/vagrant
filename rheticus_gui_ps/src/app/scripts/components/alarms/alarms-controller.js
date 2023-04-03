'use strict';

/**
 * @ngdoc function
 * @name rheticus.controller:AlarmsCtrl
 * @description
 * # AlarmsCtrl
 * Alarms Controller for rheticus project
 */
angular.module('rheticus')
	.controller('AlarmsCtrl', ['$rootScope', '$scope', '$translate', 'configuration', '$http', 'Flash',
		function ($rootScope, $scope, $translate, configuration, $http, Flash) {

			var self = this;
			var host = configuration.rheticusAPI.host
				.replace("locationHost", document.location.host)
				.replace("locationProtocol", document.location.protocol);


			var formatDate = function(dateString) {
				var year = dateString.substring(0,4);
				var month = dateString.substring(4,6);
				var day = dateString.substring(6,8);
				return new Date(year, month-1, day);
			};

			var computeMonthsUpperBound = function() {
				var measurement;
				if(self.currBookmarkScatterer.scatterer_entity.ps) {
					measurement = self.currBookmarkScatterer.scatterer_entity.ps.ps_measurement_entity.measurement;
				} else if(self.currBookmarkScatterer.scatterer_entity.ds) {
					measurement = self.currBookmarkScatterer.scatterer_entity.ds.ds_measurement_entity.measurement;
				} else if(self.currBookmarkScatterer.scatterer_entity.cr) {
					measurement = self.currBookmarkScatterer.scatterer_entity.cr.cr_measurement_entity.measurement;
				}
				measurement = JSON.parse(measurement);
				const startDate = formatDate(measurement.d[0]);
				const endDate = formatDate(measurement.d[measurement.d.length-1]);
				var months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
				months -= startDate.getMonth();
				months += endDate.getMonth();
				return months <= 0 ? 0 : months;
			};

			var computePersistenceUpperBound = function() {
				var measurement;
				if(self.currBookmarkScatterer.scatterer_entity.ps) {
					measurement = self.currBookmarkScatterer.scatterer_entity.ps.ps_measurement_entity.measurement;
				} else if(self.currBookmarkScatterer.scatterer_entity.ds) {
					measurement = self.currBookmarkScatterer.scatterer_entity.ds.ds_measurement_entity.measurement;
				} else if(self.currBookmarkScatterer.scatterer_entity.cr) {
					measurement = self.currBookmarkScatterer.scatterer_entity.cr.cr_measurement_entity.measurement;
				}
				measurement = JSON.parse(measurement);
				return measurement.m.length;
			};

			var initDefaultValues = function () {
				self.currBookmarkScatterer = undefined;
				self.threshold = undefined;
				self.persistence = undefined;
				self.monitor_exists = false;
				self.minMonths = 0;
				self.interval = self.minMonths;
				self.minPersistence = 1;
				self.persistence = self.minPersistence;
				self.isThresholdValid = true;
			};

			$scope.$on("openAlarmsPanel", function (e, data) {
				initDefaultValues();
				self.currBookmarkScatterer = data;
				if(self.currBookmarkScatterer.m_monitor_entity) {
					self.monitor_exists = true;
					self.startDate = new Date(self.currBookmarkScatterer.m_monitor_entity.m_start_date);
					self.endDate = new Date(self.currBookmarkScatterer.m_monitor_entity.m_end_date);
					self.threshold = self.currBookmarkScatterer.m_monitor_entity.m_threshold;
					self.persistence = self.currBookmarkScatterer.m_monitor_entity.m_persistence;
					self.interval = self.currBookmarkScatterer.m_monitor_entity.m_month_interval;
				}
				// months interval computation
				self.maxMonths = computeMonthsUpperBound();
				self.maxPersistence = computePersistenceUpperBound();
				// show panel
				self.showAlarmsPanel = true;
			});

			$scope.$on("closeAlarmsPanel", function () {
				self.showAlarmsPanel = false;
			});

			var closeAlarmsPanel = function () {
				self.showAlarmsPanel = false;
				initDefaultValues();
			};

			var deleteMonitor = function() {
				const url = host + '/monitor/#monitorId'
					.replace('#monitorId', String(self.currBookmarkScatterer.m_monitor_entity.m_id));
				$http.delete(url)
					.success(function (){
						self.monitor_exists = false;
						closeAlarmsPanel();
						$rootScope.$broadcast("reloadBookmarksScatterer");
						$translate('monitorDeletedLabel').then(function (translatedValue) {
							Flash.create("success", translatedValue);
						});
					})
					.error(function (){
						$translate('monitorNotDeletedLabel').then(function (translatedValue) {
							Flash.create("danger", translatedValue);
						});
					});
			};

			var changeState = function(state) {
				const url = host + '/monitor/#monitorId'
					.replace('#monitorId', String(self.currBookmarkScatterer.m_monitor_entity.m_id));
				const reqBody = {
					'monitor_month_interval': self.currBookmarkScatterer.m_monitor_entity.m_month_interval,
					'monitor_check': self.currBookmarkScatterer.m_monitor_entity.m_check,
					'monitor_state': state,
					'monitor_threshold': self.currBookmarkScatterer.m_monitor_entity.m_threshold,
					'monitor_persistence': self.currBookmarkScatterer.m_monitor_entity.m_persistence,
					'monitor_message': self.currBookmarkScatterer.m_monitor_entity.m_message,
				};
				$http.put(url, reqBody)
					.success(function (updatedMonitor) {
						$rootScope.$broadcast("reloadBookmarksScatterer");
						self.currBookmarkScatterer.m_monitor_entity = updatedMonitor.data;
						$translate('statusChangedLabel').then(function (translatedValue) {
							Flash.create("success", translatedValue);
						});
					})
					.error(function () {
						$translate('statusNotChangedLabel').then(function (translatedValue) {
							Flash.create("danger", translatedValue);
						});
					});
			};

			var saveMonitor = function () {
				if (self.threshold && !Number.isNaN(Number(self.threshold))) {
					self.isThresholdValid = true;
					if(!self.monitor_exists) {
						// monitor insertion
						const url = host + '/monitor';
						const reqBody = {
							'monitor_month_interval': self.interval,
							'monitor_check': true,
							'monitor_state': 'active',
							'monitor_threshold': self.threshold,
							'monitor_persistence': self.persistence,
							'monitor_bookmark_scatterer': self.currBookmarkScatterer.id
						};
						$http.post(url, reqBody)
							.success(function(insertedMonitor) {
								self.monitor_exists = true;
								$rootScope.$broadcast("reloadBookmarksScatterer");
								self.currBookmarkScatterer.m_monitor_entity = insertedMonitor.data;
								$translate('monitorSavedLabel').then(function (translatedValue) {
									Flash.create("success", translatedValue);
								});
							})
							.error(function () {
								$translate('monitorNotSavedLabel').then(function (translatedValue) {
									Flash.create("danger", translatedValue);
								});
							});
					} else {
						// monitor update
						const url = host + '/monitor/#monitorId'
							.replace('#monitorId', String(self.currBookmarkScatterer.m_monitor_entity.m_id));
						const reqBody = {
							'monitor_month_interval': self.interval,
							'monitor_check': self.currBookmarkScatterer.m_monitor_entity.m_check,
							'monitor_state': self.currBookmarkScatterer.m_monitor_entity.m_state,
							'monitor_threshold': self.threshold,
							'monitor_persistence': self.persistence,
							'monitor_message': self.currBookmarkScatterer.m_monitor_entity.m_message
						};
						$http.put(url, reqBody)
							.success(function (updatedMonitor) {
								$rootScope.$broadcast("reloadBookmarksScatterer");
								self.currBookmarkScatterer.m_monitor_entity = updatedMonitor.data;
								$translate('monitorSavedLabel').then(function (translatedValue) {
									Flash.create("success", translatedValue);
								});
							})
							.error(function () {
								$translate('monitorNotSavedLabel').then(function (translatedValue) {
									Flash.create("danger", translatedValue);
								});
							});
					}
				} else {
					self.isThresholdValid = self.threshold && !Number.isNaN(Number(self.threshold))? true : false;
				}
			};

			angular.extend(self, {
					"showAlarmsPanel": false,
					"closeAlarmsPanel": closeAlarmsPanel,
					"deleteMonitor": deleteMonitor,
					"changeState": changeState,
					"saveMonitor": saveMonitor,
					"minMonths": 0,
					"maxMonths": 0
				});
		}]);
