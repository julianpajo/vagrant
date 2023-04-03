'use strict';

/**
 * @ngdoc function
 * @name rheticus.controller:SwitchPanelCtrl
 * @description
 * # SwitchPanelCtrl
 * Switch Panel Controller for rheticus project
 */
angular.module('rheticus')
	.controller('SwitchPanelCtrl', ['$scope', '$location', '$rootScope', '$mdSidenav', 'olData', '$http', 'Flash', '$translate', 'BookmarkScattererService',
		function ($scope, $location, $rootScope, $mdSidenav, olData, $http, Flash, $translate, BookmarkScattererService) {

		var self = this; //this controller

		var filterSelectedAreas = function(){
			self.filteredAreas = self.userDealsDistinct;

			self.bookmarks = $rootScope.login.details.info.bookmark_entities;
			self.bookmarks.forEach(function (bookmark) {
				bookmark.editing = false;
			});
			self.filteredBookmarks = self.bookmarks;
			self.filteredBookmarksScatterer = self.bookmarksScatterer;

			if(self.search !== ""){
				self.filteredAreas = [];
				for(var i=0; i < self.userDealsDistinct.length; i++){
					if(self.userDealsDistinct[i].product_name.includes(self.search) ||
						self.userDealsDistinct[i].product_name.toLowerCase().includes(self.search) ||
						self.userDealsDistinct[i].product_name.toUpperCase().includes(self.search) ||
						self.userDealsDistinct[i].product_name.includes(self.search.toLowerCase()) ||
						self.userDealsDistinct[i].product_name.includes(self.search.toUpperCase())){
						self.filteredAreas.push(self.userDealsDistinct[i]);
					}
				}

				self.filteredBookmarks = [];
				for(var i=0; i < self.bookmarks.length; i++){
					if(self.bookmarks[i].name.includes(self.search) ||
						self.bookmarks[i].name.toLowerCase().includes(self.search) ||
						self.bookmarks[i].name.toUpperCase().includes(self.search) ||
						self.bookmarks[i].name.includes(self.search.toLowerCase()) ||
						self.bookmarks[i].name.includes(self.search.toUpperCase())){
						self.filteredBookmarks.push(self.bookmarks[i]);
					}
				}

				self.filteredBookmarksScatterer = [];
				for(var i=0; i < self.bookmarksScatterer.length; i++){
					if(self.bookmarksScatterer[i].name.includes(self.search) ||
						self.bookmarksScatterer[i].name.toLowerCase().includes(self.search) ||
						self.bookmarksScatterer[i].name.toUpperCase().includes(self.search) ||
						self.bookmarksScatterer[i].name.includes(self.search.toLowerCase()) ||
						self.bookmarksScatterer[i].name.includes(self.search.toUpperCase())){
						self.filteredBookmarksScatterer.push(self.bookmarksScatterer[i]);
					}
				}
			}
		};

		var bookmarks;
		var bookmarkCount = 0;
		var disableBookmarksControls = false;

		var setDealProductName = function (deal) {
			$rootScope.login.details.selectedArea = deal.product_name;
			$location.search('fromExt', null);
		};

		var filterDeals = function (deals) {
			var newDealList = [];
			for (var i = 0; i < deals.length; i++) {
				if (deals[i].service_type === "displacement") {
					newDealList.push(deals[i]);
				}
			}
			return newDealList;
		};

		var addBookmark = function (idx) {
			self.bookmarkCount ++;
			olData.getMap('map-default').then(function (map) {
				var extent = map.getView().calculateExtent(map.getSize());
				const firstPoint = ol.proj.transform([extent[0], extent[1]], 'EPSG:3857', 'EPSG:4326');
				const secondPoint = ol.proj.transform([extent[2], extent[1]], 'EPSG:3857', 'EPSG:4326');
				const thirdPoint = ol.proj.transform([extent[2], extent[3]], 'EPSG:3857', 'EPSG:4326');
				const fourthPoint = ol.proj.transform([extent[0], extent[3]], 'EPSG:3857', 'EPSG:4326');
				const geometry = new ol.geom.Polygon([[[firstPoint, secondPoint, thirdPoint, fourthPoint, firstPoint]]]);
				const geoJsonObject = {
					"type": "Polygon",
					"coordinates": [
						[firstPoint, secondPoint, thirdPoint, fourthPoint, firstPoint]
					]
				};
				self.bookmarks.unshift({
					name: '',
					extent: geometry.getCoordinates()[0],
					geom_geo_json: JSON.stringify(geoJsonObject),
					editing: true
				});
				setTimeout(function () {
					$translate('newBookmarkLabell').then(function (translatedValue) {
						document.getElementById('bookmark-' + idx).value = translatedValue + ' ' + self.bookmarkCount;
						document.getElementById('bookmark-' + idx).select();
					});
				}, 100);
			});
		};

		var startEditingBookmark = function (index) {
			self.bookmarks[index].editing = true;
			setTimeout(function () {
				$translate('newBookmarkLabell').then(function (translatedValue) {
					if (self.bookmarks[index].name !== '') {
						document.getElementById('bookmark-' + index).value = self.bookmarks[index].name;
					} else {
						document.getElementById('bookmark-' + index).value = translatedValue + ' ' + self.bookmarkCount;
					}
					document.getElementById('bookmark-' + index).select();
				});
			}, 100);
		};

		var moveToBookmark = function (geom_geo_json) {
			var parsedGeom = JSON.parse(geom_geo_json);
			$scope.setMapViewExtent(
				parsedGeom.type,
				parsedGeom.coordinates
			);
			// $mdSidenav('areaMenu').close();
		};

		var getBookmarkName = function (name) {
			if(name.length <= 20) {
				return name;
			}
			return name.substring(0,17) + '...';
		};

		var keyPressed = function (key, index) {
			if (key !== 'Enter') {
				return;
			}
			self.renameBookmark(index);
		};

		var renameBookmark = function (index) {
			self.bookmarks[index].name = document.getElementById('bookmark-' + index).value;
			self.bookmarks[index].editing = false;
			if(!self.disableBookmarksControls) {
				var apiurl = $rootScope.configurationCurrentHost.rheticusAPI.host +
					$rootScope.configurationCurrentHost.rheticusAPI.bookmarks +
					"?" + new Date().getTime();
				var postObj = JSON.stringify(self.bookmarks[index]);
				$http.post(apiurl, postObj, {
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
						'Access-Control-Allow-Headers': 'Content-Type'
					}
				})
					.success(function (data) {
						self.bookmarks[index].id = data.data.id;
						$translate('savedBookmarkLabel').then(function (translatedValue) {
							Flash.create("success", translatedValue);
						});
					})
					.error(function (data) {
						console.log("error");
						//HTTP STATUS != 200
						var message = (data.code && (data.code !== "")) ? data.code : "";
						message += (data.message && (data.message !== "")) ? ((message !== "") ? " : " : "") + response.message : "";
						$translate('erroreSavingBookmarkLabel').then(function (translatedValue) {
							Flash.create("danger", translatedValue);
						});
					});
			}
		};

		var deleteBookmark = function (id) {
			var apiurl = $rootScope.configurationCurrentHost.rheticusAPI.host +
				$rootScope.configurationCurrentHost.rheticusAPI.bookmarks +
				"/" + id + "?" + new Date().getTime();
			$http.delete(apiurl)
				.success(function () {
					for(var i=0; i < self.bookmarks.length; i++) {
						if(self.bookmarks[i].id === id) {
							self.bookmarks.splice(i, 1);
						}
					}
					for(var i=0; i < self.filteredBookmarks.length; i++) {
						if(self.filteredBookmarks[i].id === id) {
							self.bookmarks.splice(i, 1);
						}
					}
					hideBookmarkDetails(true);
					$translate('deletedBookmarkLabel').then(function (translatedValue) {
						Flash.create("success", translatedValue);
					});
				})
				.error(function () {
					$translate('errorDeletingBookmarkLabel').then(function (translatedValue) {
						Flash.create("danger", translatedValue);
					});
				});
		};

		$rootScope.$watch("login.details.info", function (user) {
			if (!user || user === null) {return;}

			//reset filteredAreas and filteredBookmarks
			self.filteredAreas = [];
			self.filteredBookmarks = [];

			//reset distinct array
			self.userDealsDistinct = [];
			self.bookmarks = $rootScope.login.details.info.bookmark_entities;
			self.bookmarks.forEach(function (bookmark) {
				bookmark.editing = false;
			});

			self.filteredBookmarks = self.bookmarks;

			if($rootScope.login.details.info.username === 'anonymous'){
				self.disableBookmarksControls = true;
			} else {
				self.disableBookmarksControls = false;
			}
			var deals = user.organization_entity.deals;
			deals = filterDeals(deals);
			for (var i = 0; i < deals.length - 1; i++) {
				for (var j = i + 1; j < deals.length; j++) {
					if (deals[i].product_name > deals[j].product_name) {
						var tempDeal = deals[i];
						deals[i] = deals[j];
						deals[j] = tempDeal;
					}
				}
			}
			//var deals = $scope.getUserDeals();
			if ($location.search().fromExt === undefined) {
				if (user.name && (user.name !== "") && (user.name.indexOf("anonymous") === -1)) {
					if (deals.length !== 0) {
						var parsedGeom = JSON.parse(deals[0].geom_geo_json);
						$scope.setMapViewExtent(
							parsedGeom.type,
							parsedGeom.coordinates
						);
						setDealProductName(deals[0]);
					}
				}
			}
			//setLastUpdate call api "maestro" TODO

			//REMOVE DUPLICATE AREAS
			for (var i = 0; i < deals.length; i++) {
				var j = i + 1;
				var trovato = false;
				while (j < deals.length && !trovato) {
					if (deals[i].product_name === deals[j].product_name) {
						trovato = true;
					}
					j++;
				}
				if (!trovato) {
					self.userDealsDistinct.push(deals[i]);
					self.filteredAreas.push(deals[i]);
				}
			}
		});

		/**
		 * Edit the Bookmark Scatterer when user press Enter key
		 * @param key Key pressed
		 * @param record Bookmark Scatterer to edit
		 */
		var keyPressedEditBookmarkScatterer = function(key, record){
			if (key !== 'Enter') return;
			editBookmarkScatterer(record);
		};

		/**
		 * Enables the Edit Mode of the Bookmark Scatterer
		 * @param record Bookmark Scatterer that has to be in Edit Mode
		 */
		var startEditBookmarkScatterer = function(record){
			record.editing = !record.editing;
		};

			/**
			 * Edit a Bookmark Scatterer calling the backend API
			 * @param record Bookmark Scatterer to edit
			 */
		var editBookmarkScatterer = function (id, name){
			const apiUrl = $rootScope.configurationCurrentHost.rheticusAPI.host + '/bookmarks_scatterer/'+id;
			const postBody = {'bookmark_scatterer_name': name };
			$http.put(apiUrl, postBody)
				.success(function () {
					bookmarkScattererToEditBckp.name = name;
					$translate('bookmarkScattererUpdated').then(function (translatedValue) {
						Flash.create("success", translatedValue);
					});
				})
				.error(function () {
					// error updating bookmark scatterer
					$translate('bookmarkScattererNotUpdated').then(function (translatedValue) {
						Flash.create("danger", translatedValue);
					});
				});
		};

		/**
		 * Delete a Bookmark Scatterer calling the backend API
		 * @param record Bookmark Scatterer to delete
		 */
		var deleteBookmarkScatterer = function(record){
			var apiUrl = $rootScope.configurationCurrentHost.rheticusAPI.host + '/bookmarks_scatterer/#bookmarkScattererId';
			apiUrl = apiUrl.replace('#bookmarkScattererId', record.id);
			$http.delete(apiUrl)
				.success(function(){
					showBookmarkScattererDetails(undefined);
					BookmarkScattererService.setBookmarkScattererDictValue(record.scatterer_entity.id, false);
					BookmarkScattererService.removeBookmarkScatterer(record.id);
					$translate('bookmarkScattererDeleted').then(function (translatedValue) {
						Flash.create("success", translatedValue);
					});
				})
				.error(function(){
					$translate('bookmarkScattererNotDeleted').then(function (translatedValue) {
						Flash.create("danger", translatedValue);
					});
				});
		};

		/**
		 * Move map position on Bookmark Scatterer position
		 * @param record Bookmark Scatterer to move to
		 */
		var moveToBookmarkScatterer = function(record) {
			var latLonObj;
			var latLonArray;
			if(record.scatterer_entity.ps){
				latLonObj = {
					lat: record.scatterer_entity.ps.lat,
					lon: record.scatterer_entity.ps.lon,
					zoom: 20
				};
				latLonArray = [record.scatterer_entity.ps.lon, record.scatterer_entity.ps.lat];
			} else if(record.scatterer_entity.ds){
				latLonObj = {
					lat: record.scatterer_entity.ds.lat,
					lon: record.scatterer_entity.ds.lon,
					zoom: 20
				};
				latLonArray = [record.scatterer_entity.ds.lon, record.scatterer_entity.ds.lat];
			} else if(record.scatterer_entity.cr){
				latLonObj = {
					lat: record.scatterer_entity.cr.lat,
					lon: record.scatterer_entity.cr.lon,
					zoom: 20
				};
				latLonArray = [record.scatterer_entity.cr.lon, record.scatterer_entity.cr.lat];
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
			}, 1000);
		};

		/**
		 * Watch the state of sidenav and when is open retrieves the list
		 * of Bookmark Scatterer for the logged user
		 */
		$rootScope.$watch(function (){
			return $rootScope.main.isSidenavOpen && $rootScope.main.selectedSidenav === 'areas';
		},function(isOpen){
			if(isOpen && self.lastOpenValue !== isOpen) {
				BookmarkScattererService.updateBookmarkScattererList();
				if(!self.bookmarksScatterer){
					self.filteredBookmarksScatterer = BookmarkScattererService.getBookmarkScattererList();
				}
				self.bookmarksScatterer = BookmarkScattererService.getBookmarkScattererList();
			}
			self.lastOpenValue = isOpen;
		});

			/**
			 * Reload bookmark scatterer list when event is triggered
			 */
		$scope.$on("reloadBookmarksScatterer", function() {
			BookmarkScattererService.updateBookmarkScattererList();
			if(!self.bookmarksScatterer){
				self.filteredBookmarksScatterer = BookmarkScattererService.getBookmarkScattererList();
			}
			self.bookmarksScatterer = BookmarkScattererService.getBookmarkScattererList();
		});

			/**
			 * It creates a link which shares bookmark scatterer location on Rheticus
			 * @param record Object whose coordinates have to be copied
			 */
		var shareBookmarkScattererLocation = function(record){
			var lonLat;
			if(record.scatterer_entity.ps) {
				lonLat = [record.scatterer_entity.ps.lon, record.scatterer_entity.ps.lat];
			} else if(record.scatterer_entity.ds) {
				lonLat = [record.scatterer_entity.ds.lon, record.scatterer_entity.ds.lat];
			} else if(record.scatterer_entity.cr) {
				lonLat = [record.scatterer_entity.cr.lon, record.scatterer_entity.cr.lat];
			}
			$scope.copyBookmarkScattererLocation(lonLat);
			$translate('successfullCopy').then(function (translatedValue) {
				Flash.create("success", translatedValue);
			});
		};

		var filterBookmarkScatterersByMonitorState = function(state){
			if (state === 'all') {
				self.filteredBookmarksScatterer = self.bookmarksScatterer;
			} else {
				self.filteredBookmarksScatterer = [];
				self.bookmarksScatterer.forEach(function(element){
					if (element.m_monitor_entity && element.m_monitor_entity.m_state === state) {
						self.filteredBookmarksScatterer.push(element);
					}
				});
			}
		};

		/**
		 * PUBLIC VARIABLES AND METHODS
		 */

		var minimize = function () {
			self.isCollapsed = !self.isCollapsed;
		};
		//PS
		var switchOverlayPs = function () {
			toggleOverlay("ps");
		};
		var viewPanelPs = function () {
			viewPanel("ps");
		};
		var viewPanelPsProviders = function () {
			viewPanel("ps_provider");
		};
		var viewPanelPsAoi = function () {
			viewPanel("ps_aoi");
		};
		var updateSelectionArea = function (position, entities) {
			$scope.setMapViewExtent(
				JSON.parse(entities[position].geom_geo_json).type,
				JSON.parse(entities[position].geom_geo_json).coordinates
			);
			setDealProductName(entities[position]);
			// $mdSidenav('areaMenu').close();
		};

		//IFFI
		var switchOverlayIffi = function () {
			toggleOverlay("iffi");
		};
		var viewPanelIffi = function () {
			viewPanel("iffi");
		};
		//SENTINEL
		// var switchOverlaySentinel = function(){
		// 	toggleOverlay("sentinel");
		// };
		// var viewPanelSentinel = function(){
		// 	viewPanel("sentinel");
		// };
		//PSCANDIDATE
		var switchOverlaypsCandidate = function () {
			toggleOverlay("psCandidate");
		};
		var viewPanelpsCandidate = function () {
			viewPanel("psCandidate");
		};

		//COWI BASEMAP GELA-NISCEMI DEMO
		var switchOverlayCowiGelaNiscemi = function () {
			toggleOverlay("cowiGelaNiscemi");
		};
		var viewPanelCowiGelaNiscemi = function () {
			viewPanel("cowiGelaNiscemi");
		};

		var setAddBookmarkMode = function(flag) {
			if(!$rootScope.mapMode.default) {
				$translate('deactivateWidgetLabel').then(function (translatedValue) {
					Flash.create("danger", translatedValue);
				});
			} else {
				self.addBookmarkMode = flag;
			}
		};

		var vectorSource;
		var vectorLayer;
		var drawInteraction;
		var selectInteraction;
		var modifyInteraction;
		var initDone = false;
		var lastPolygonArea = 0;

		var clearMap = function (map) {
			if(!map) {
				olData.getMap('map-default').then(function(map){
					if(drawInteraction) {
						map.removeInteraction(drawInteraction);
						drawInteraction = undefined;
					}
					if(selectInteraction) {
						map.removeInteraction(selectInteraction);
						selectInteraction = undefined;
					}
					if(modifyInteraction) {
						map.removeInteraction(modifyInteraction);
						modifyInteraction = undefined;
					}
					if(vectorLayer){
						vectorLayer.getSource().clear();
					}
				});
			} else {
				if(drawInteraction) {
					map.removeInteraction(drawInteraction);
					drawInteraction = undefined;
				}
				if(selectInteraction) {
					map.removeInteraction(selectInteraction);
					selectInteraction = undefined;
				}
				if(modifyInteraction) {
					map.removeInteraction(modifyInteraction);
					modifyInteraction = undefined;
				}
				if(vectorLayer) {
					vectorLayer.getSource().clear();
				}
			}
		};

		var initDrawInteraction = function(map) {
			vectorSource = new ol.source.Vector({ wrapX: false });
			vectorSource.on("addfeature", function(evt) {
				$scope.coords = evt.feature.getGeometry().getCoordinates();
			});
			vectorLayer = new ol.layer.Vector({
				source: vectorSource
			});
			map.addLayer(vectorLayer);
			initDone = true;
		};

		var drawBox = function () {
			olData.getMap('map-default').then(function(map){
				if(!initDone) {
					initDrawInteraction(map);
				}
				clearMap(map);
				drawInteraction = new ol.interaction.Draw({
					source: vectorSource,
					type: 'Circle',
					geometryFunction: ol.interaction.Draw.createBox()
				});
				map.addInteraction(drawInteraction);
				drawInteraction.on('drawend', drawCallback);
			});
		};

		var drawPolygon = function () {
			olData.getMap('map-default').then(function(map){
				if(!initDone) {
					initDrawInteraction(map);
				}
				clearMap(map);
				drawInteraction = new ol.interaction.Draw({
					source: vectorSource,
					type: 'Polygon'
				});
				map.addInteraction(drawInteraction);
				drawInteraction.on('drawend', drawCallback);
			});
		};

		var selectVisibleArea = function () {
			olData.getMap('map-default').then(function (map) {
				var extent = map.getView().calculateExtent(map.getSize());
				const firstPoint = ol.proj.transform([extent[0], extent[1]], 'EPSG:3857', 'EPSG:4326');
				const secondPoint = ol.proj.transform([extent[2], extent[1]], 'EPSG:3857', 'EPSG:4326');
				const thirdPoint = ol.proj.transform([extent[2], extent[3]], 'EPSG:3857', 'EPSG:4326');
				const fourthPoint = ol.proj.transform([extent[0], extent[3]], 'EPSG:3857', 'EPSG:4326');
				const geometry = [firstPoint, secondPoint, thirdPoint, fourthPoint];
				showEditableGeometry(geometry);
			});
		};

		var getNumberOfScattererQuery = function(geom) {
			var features = new ol.Feature({geometry: new ol.geom.Polygon([geom])});
			var format = new ol.format.WKT();
			var wktRepresentation  = format.writeGeometry(features.getGeometry());
			var userLayer = $rootScope.login.details.info.layer;
			const header = {'Authorization': 'Basic '+ $rootScope.login.details.geoserver_authdata};
			const url = "#locationProtocol//#locationHost/geoserver/wfs?propertyName=scattererid&service=wfs&version=2.0.0&request=GetFeature&typeNames=#userLayer&count=1&cql_filter=INTERSECTS(geom,SRID=4326;#wktPolygon)&outputFormat=application/json"
				.replace("#locationProtocol", document.location.protocol)
				.replace("#locationHost", document.location.host)
				.replace("#userLayer", userLayer)
				.replace("#wktPolygon", wktRepresentation);

			return $http.get(url, {headers: header});
		};

		const INSIDE_GEOMETRY_SCATTERERS_LIMIT = 20000;
		var checkPolygonArea = function(geom) {
			lastPolygonArea = getGeometryArea(geom);
			getNumberOfScattererQuery(geom)
				.success(function(response){
					const scatterersNumber = response.totalFeatures;
					self.groupMonitorDisabled = !(lastPolygonArea > 0 && lastPolygonArea < 10 && scatterersNumber <= INSIDE_GEOMETRY_SCATTERERS_LIMIT);
					self.tooManyScatterer = scatterersNumber > INSIDE_GEOMETRY_SCATTERERS_LIMIT;
					self.extensionTooLarge = lastPolygonArea < 0 || lastPolygonArea > 10;
					self.monitorGroupErrorMessage = setMonitorGroupErrorMessage();

					if(self.groupMonitorDisabled){
						self.editBookmarkMonitorPanel = false;
						self.addBookmarkMonitorPanel = false;
					} else if(!self.groupMonitorDisabled && self.bookmarkToEdit &&
						self.bookmarkToEdit.m_monitor_group_entity.m_id) {
						self.editBookmarkMonitorPanel = true;
					}

					if(self.groupMonitorDisabled && self.bookmarkToEdit) {
						if(self.bookmarkToEdit.m_monitor_group_entity.m_id) {
							self.bookmarkToEdit.m_monitor_group_entity = bookmarkToEditBckp.m_monitor_group_entity;
							self.bookmarkToEdit.m_monitor_group_entity.m_state_bool =
								self.bookmarkToEdit.m_monitor_group_entity.m_state === 'active' ||
								self.bookmarkToEdit.m_monitor_group_entity.m_state === 'triggered';
						} else {
							self.bookmarkToEdit.m_monitor_group_entity = {};
							self.bookmarkToEdit.m_monitor_group_entity.m_state_bool = true;
							self.bookmarkToEdit.m_monitor_group_entity.m_threshold = 1;
							self.bookmarkToEdit.m_monitor_group_entity.m_month_interval = 0;
							self.bookmarkToEdit.m_monitor_group_entity.m_persistence = 3;
						}
					}
				})
				.error(function(e){
					console.log(e);
				});
		};

		var setMonitorGroupErrorMessage = function() {
			if(self.tooManyScatterer && !self.extensionTooLarge){
				$translate('monitorTooManyScatterersLabel').then(function (translatedValue) {
					self.disabledMonitorTooltip = translatedValue;
					Flash.create("warning", translatedValue);
				});
				return true;
			} else if(!self.tooManyScatterer && self.extensionTooLarge){
				$translate('monitorExtensionTooLargeLabel').then(function (translatedValue) {
					self.disabledMonitorTooltip = translatedValue;
					Flash.create("warning", translatedValue);
				});
				return true;
			} else if(self.tooManyScatterer && self.extensionTooLarge) {
				$translate('extensionTooLargeAndTooManyScatterersLabel').then(function (translatedValue) {
					self.disabledMonitorTooltip = translatedValue;
					Flash.create("warning", translatedValue);
				});
				return true;
			} else {
				$translate('addMonitorTooltip').then(function (translatedValue) {
					self.disabledMonitorTooltip = translatedValue;
				});
				return false;
			}
		};

		var getGeometryArea = function (geom) {
			if (typeof geom === 'string' || geom instanceof String) {
				geom = JSON.parse(geom).coordinates[0];
			}
			return (Math.abs(self.olSphere.geodesicArea(geom))) / 1000 / 1000;
		};

		var drawCallback = function (e) {
			var geoJson = JSON.parse(new ol.format.GeoJSON().writeFeatures([e.feature]));
			self.addBookmarkGeom = JSON.parse(JSON.stringify(geoJson.features[0].geometry));
			geoJson.features[0].geometry.coordinates[0].forEach(function(e, i){
				self.addBookmarkGeom.coordinates[0][i] = ol.proj.transform([e[0], e[1]], 'EPSG:3857', 'EPSG:4326');
			});
			checkPolygonArea(self.addBookmarkGeom.coordinates[0]);
			olData.getMap('map-default').then(function (map){
				var features = e.feature;
				selectInteraction = new ol.interaction.Select();
				map.removeInteraction(drawInteraction);
				drawInteraction = undefined;
				selectInteraction.getFeatures().push(features);
				map.addInteraction(selectInteraction);
				modifyInteraction = new ol.interaction.Modify({ features: selectInteraction.getFeatures() });
				map.addInteraction(modifyInteraction);
				modifyInteraction.on('modifyend', function(e) {
					e.features.forEach(function (feature) {
						var modifiedGeometry = feature.getGeometry().getCoordinates();
						modifiedGeometry[0].forEach(function(e, i){
							modifiedGeometry[0][i] = ol.proj.transform([e[0], e[1]], 'EPSG:3857', 'EPSG:4326');
						});
						self.addBookmarkGeom = {type: "Polygon", coordinates: modifiedGeometry};
						checkPolygonArea(self.addBookmarkGeom.coordinates[0]);
					});
				});
			});
		};

		var validateBookmarkInsertion = function() {
			return self.addBookmarkName && self.addBookmarkName.trim() && self.addBookmarkGeom;
		};

		var validateGroupMonitorInsertion = function() {
			return ""+self.groupMonitorThreshold && ""+self.groupMonitorThreshold+"".trim() && !Number.isNaN(Number(""+self.groupMonitorThreshold));
		};

		var saveBookmark = function () {
			if(self.addBookmarkMonitorPanel && validateBookmarkInsertion() && validateGroupMonitorInsertion()) {
				const apiUrl = $rootScope.configurationCurrentHost.rheticusAPI.host + '/bookmarks';
				const bookmark = {
					name: self.addBookmarkName,
					geom_geo_json: JSON.stringify(self.addBookmarkGeom),
					editing: false
				};
				$http.post(apiUrl, bookmark)
					.success(function(bookmarkAdded){
						const apiUrl = $rootScope.configurationCurrentHost.rheticusAPI.host + '/monitor_group';
						const monitorGroup = {
							monitor_group_month_interval : self.groupMonitorInterval,
							monitor_group_check: true,
							monitor_group_state: self.groupMonitorStateBool ? "active" : "pause",
							monitor_group_threshold: self.groupMonitorThreshold * 10,
							monitor_group_persistence: self.groupMonitorPersistence,
							monitor_group_bookmark: bookmarkAdded.data.id,
							monitor_group_last_measure_date_auto: true
						};
						$http.post(apiUrl, monitorGroup)
							.success(function(addedMonitor){
								const newBookmark = JSON.parse(JSON.stringify(bookmarkAdded.data));
								newBookmark.m_monitor_group_entity = addedMonitor.data;
								self.bookmarks.push(newBookmark);
								$translate('savedBookmarkLabel').then(function (translatedValue) {
									Flash.create("success", translatedValue);
								});
								exitAddBookmarkMode();
							})
							.error(function(){
								$translate('erroreSavingBookmarkLabel').then(function (translatedValue) {
									Flash.create("danger", translatedValue);
								});
							});
					})
					.error(function(){
						$translate('erroreSavingBookmarkLabel').then(function (translatedValue) {
							Flash.create("danger", translatedValue);
						});
					});
			} else if(!self.addBookmarkMonitorPanel && validateBookmarkInsertion()) {
				const apiUrl = $rootScope.configurationCurrentHost.rheticusAPI.host + '/bookmarks';
				const bookmark = {
					name: self.addBookmarkName,
					geom_geo_json: JSON.stringify(self.addBookmarkGeom),
					editing: false
				};
				$http.post(apiUrl, bookmark)
					.success(function(bookmarkAdded){
						self.bookmarks.push(JSON.parse(JSON.stringify(bookmarkAdded.data)));
						$translate('savedBookmarkLabel').then(function (translatedValue) {
							Flash.create("success", translatedValue);
						});
						exitAddBookmarkMode();
					})
					.error(function(){
						$translate('erroreSavingBookmarkLabel').then(function (translatedValue) {
							Flash.create("danger", translatedValue);
						});
					});
			}
		};

		var exitAddBookmarkMode = function(){
			clearMap(undefined);
			setAddBookmarkMode(false);
			self.addBookmarkName = undefined;
			self.addBookmarkGeom = undefined;
			self.addBookmarkMonitorPanel = false;
			self.groupMonitorStateBool = true;
			self.groupMonitorDisabled = true;
			self.groupMonitorThreshold = 1;
			self.groupMonitorPersistence = 3;
			self.groupMonitorInterval = 0;
			self.editBookmarkMonitorPanel = false;
		};

		var showAllGeometries = function () {
			self.showAllGeometriesFlag = true;
			self.filteredBookmarks.forEach(function(bookmark){
				if(!bookmark.showGeometry) {
					showGeometryOnMap(bookmark.id, JSON.parse(bookmark.geom_geo_json), bookmark.name);
					bookmark.showGeometry = true;
				}
			});
		};

		var hideAllGeometries = function () {
			self.showAllGeometriesFlag = false;
			self.filteredBookmarks.forEach(function(bookmark){
				hideGeometryOnMap(bookmark.id);
				bookmark.showGeometry = false;
			});
		};

		var showBookmarkGeometry = function(bookmark, flag) {
			bookmark.showGeometry = flag;
			if(flag) {
				showGeometryOnMap(bookmark.id, JSON.parse(bookmark.geom_geo_json), bookmark.name);
				moveOnGeometry(JSON.parse(bookmark.geom_geo_json).coordinates[0]);
			} else {
				resetShowAllGeometriesButton();
				hideGeometryOnMap(bookmark.id);
			}
		};

		var resetShowAllGeometriesButton = function () {
			var allGeometryDisabled = true;
			self.filteredBookmarks.forEach(function(bookmark){
				if (bookmark.showGeometry) {
					allGeometryDisabled = false;
				}
			});
			if(allGeometryDisabled && self.showAllGeometriesFlag) {
				self.showAllGeometriesFlag = false;
			}
		};

		var showGeometryOnMap = function (id, geom, name){
			var ring = JSON.parse(JSON.stringify(geom.coordinates[0]));
			ring.push(ring[0]);
			var polygon = new ol.geom.Polygon([ring]);
			polygon.transform('EPSG:4326', 'EPSG:3857');
			// Create feature with polygon.
			var feature = new ol.Feature(polygon);
			// Create vector source and the feature to it.
			var vectorSource = new ol.source.Vector();
			vectorSource.addFeature(feature);
			// Create vector layer attached to the vector source.
			const currentGeometryName = name && name.trim() !== '' ? name : '';
			var vectorLayer = new ol.layer.Vector({
				source: vectorSource,
				style: new ol.style.Style({
					stroke: new ol.style.Stroke({
						color: 'red',
						width: 3,
					}),
					fill: new ol.style.Fill({
						color: 'rgba(255, 0, 0, 0.25)',
					}),
					text: new ol.style.Text({
						font: 'bold 18px Courier New',
						fill: new ol.style.Fill({ color: '#ff0000' }),
						stroke: new ol.style.Stroke({color: '#fff', width: 2}),
						text: currentGeometryName
					})
				})
			});
			// Add the vector layer to the map.
			$scope.mapsIds.forEach(function(mapId){
				olData.getMap(mapId).then(function(map){
					map.addLayer(vectorLayer);
					self.visibleGeometriesMap[""+id+""] = vectorLayer;
				});
			});
		};

		var hideGeometryOnMap = function(id) {
			if(self.visibleGeometriesMap[""+id+""]) {
				const layerToRemove =  self.visibleGeometriesMap[""+id+""];
				$scope.mapsIds.forEach(function(mapId){
					olData.getMap(mapId).then(function(map){
						map.removeLayer(layerToRemove);
					});
				});
				delete self.visibleGeometriesMap[""+id+""];
			}
		};

		var showBookmarkDetails = function (bookmark) {
			getNumberOfScattererQuery(JSON.parse(bookmark.geom_geo_json).coordinates[0])
				.success(function(response){
					bookmark.scatterersNumber = response.totalFeatures;
					self.detailedBookmark = bookmark;
				})
				.error(function(){
					self.detailedBookmark = bookmark;
				});
		};

		var bookmarkToEditBckp;
		var setEditBookmarkMode = function(flag) {
			self.editBookmarkMode = flag;
			if(flag) {
				bookmarkToEditBckp = self.detailedBookmark;
				self.bookmarkToEdit = JSON.parse(JSON.stringify(bookmarkToEditBckp));

				// init to avoid failure
				if(!self.bookmarkToEdit.m_monitor_group_entity) {
					self.bookmarkToEdit.m_monitor_group_entity = {};
					self.bookmarkToEdit.m_monitor_group_entity.m_state_bool = true;
					self.bookmarkToEdit.m_monitor_group_entity.m_threshold = 1;
					self.bookmarkToEdit.m_monitor_group_entity.m_month_interval = 0;
					self.bookmarkToEdit.m_monitor_group_entity.m_persistence = 3;
				} else {
					self.bookmarkToEdit.m_monitor_group_entity.m_state_bool =
						self.bookmarkToEdit.m_monitor_group_entity.m_state === 'active' || self.bookmarkToEdit.m_monitor_group_entity.m_state === 'triggered';
					// convert from mm to cm
					self.bookmarkToEdit.m_monitor_group_entity.m_threshold /= 10;
				}

				self.addBookmarkGeom = JSON.parse(self.bookmarkToEdit.geom_geo_json);
				self.detailedBookmark = undefined;

				disableShowGeometry();
				showEditableGeometry(self.addBookmarkGeom.coordinates[0]);
				moveOnGeometry(self.addBookmarkGeom.coordinates[0]);

				if(self.bookmarkToEdit.m_monitor_group_entity.m_id) {
					self.editBookmarkMonitorPanel = true;
					self.groupMonitorDisabled = false;
				} else {
					self.editBookmarkMonitorPanel = false;
					checkPolygonArea(self.addBookmarkGeom.coordinates[0]);
				}
			} else {
				clearMap(undefined);
				self.detailedBookmark = bookmarkToEditBckp;
				monitorIdToDelete = undefined;
				// bookmarkToEditBckp = undefined;
				// self.bookmarkToEdit = undefined;
				self.addBookmarkGeom = undefined;
				self.editBookmarkMonitorPanel = false;
				self.groupMonitorDisabled = true;
			}
		};

		var showEditableGeometry = function(geom) {
			olData.getMap('map-default').then(function(map){
				if(!initDone){
					initDrawInteraction(map);
				}
				clearMap(map);

				var ring = JSON.parse(JSON.stringify(geom));
				ring.push(ring[0]);
				self.addBookmarkGeom = {type: "Polygon", coordinates: [ring]}

				var polygon = new ol.geom.Polygon([ring]);
				polygon.transform('EPSG:4326', 'EPSG:3857');
				var feature = new ol.Feature(polygon);
				vectorSource.addFeature(feature);

				selectInteraction = new ol.interaction.Select();
				modifyInteraction = new ol.interaction.Modify({
					features: selectInteraction.getFeatures()
				});
				checkPolygonArea(ring);
				modifyInteraction.on('modifyend', function(e) {
					e.features.forEach(function (feature) {
						var modifiedGeometry = feature.getGeometry().getCoordinates();
						modifiedGeometry[0].forEach(function(e, i){
							modifiedGeometry[0][i] = ol.proj.transform([e[0], e[1]], 'EPSG:3857', 'EPSG:4326');
						});
						self.addBookmarkGeom = {type: "Polygon", coordinates: modifiedGeometry};
						checkPolygonArea(self.addBookmarkGeom.coordinates[0]);
					});
				});
				map.addInteraction(selectInteraction);
				map.addInteraction(modifyInteraction);
			});
		};

		var hideBookmarkDetails = function (hideGeom) {
			if(hideGeom){
				hideGeometryOnMap(self.detailedBookmark.id);
			}
			self.detailedBookmark.showDetails = undefined;
			self.detailedBookmark = undefined;
			self.geomButtonDisabled = false;
		};

		var saveEditedBookmark = function() {
			if(!self.monitorGroupErrorMessage || !self.bookmarkToEdit.m_monitor_group_entity.m_id) {
				if(monitorIdToDelete){
					deleteMonitorGroup(JSON.parse(JSON.stringify(monitorIdToDelete)));
					monitorIdToDelete = undefined;
				}

				if(validateBookmarkEdit()) {
					updateBookmark();
					if(!self.groupMonitorDisabled && self.editBookmarkMonitorPanel &&
						self.bookmarkToEdit.m_monitor_group_entity && self.bookmarkToEdit.m_monitor_group_entity.m_id) {
						if(validateGroupMonitorEdit()) {
							updateMonitorGroup();
							setEditBookmarkMode(false);
						}
					} else if(!self.groupMonitorDisabled && self.editBookmarkMonitorPanel &&
						self.bookmarkToEdit.m_monitor_group_entity && !self.bookmarkToEdit.m_monitor_group_entity.m_id) {
						if(validateGroupMonitorEdit()) {
							insertMonitorGroup();
							setEditBookmarkMode(false);
						}
					} else {
						setEditBookmarkMode(false);
					}
				}
			} else {
				if(self.extensionTooLarge){
					$translate('bookmarkNotSavedIncorrectGeometry').then(function (translatedValue) {
						Flash.create("danger", translatedValue);
					});
				}
				if(self.tooManyScatterer) {
					$translate('bookmarkNotSavedIncorrectScatterersNumber').then(function (translatedValue) {
						Flash.create("danger", translatedValue);
					});
				}
			}
		};

		var updateBookmark = function() {
			const apiUrl = $rootScope.configurationCurrentHost.rheticusAPI.host + '/bookmarks';
			const bookmarkToEditCpy = JSON.parse(JSON.stringify(self.bookmarkToEdit));
			const bookmark = {
				id: bookmarkToEditCpy.id,
				name: bookmarkToEditCpy.name,
				geom_geo_json: JSON.stringify(self.addBookmarkGeom)
			};
			$http.post(apiUrl, bookmark)
				.success(function(updatedBookmark) {
					updatedBookmark = updatedBookmark.data;
					for(var i = 0; i < self.bookmarks.length; i++) {
						if (self.bookmarks[i].id === updatedBookmark.id) {
							self.bookmarks[i].name = updatedBookmark.name;
							self.bookmarks[i].geom_geo_json = updatedBookmark.geom_geo_json;
							self.bookmarks[i].geom = JSON.parse(updatedBookmark.geom_geo_json);
							bookmarkToEditBckp = self.bookmarks[i];
							break;
						}
					}
					$translate('savedBookmarkLabel').then(function (translatedValue) {
						Flash.create("success", translatedValue);
					});
				})
				.error(function(){
					$translate('erroreSavingBookmarkLabel').then(function (translatedValue) {
						Flash.create("danger", translatedValue);
					});
				});
		};

		var updateMonitorGroup = function() {
			const bookmarkToEditCpy = JSON.parse(JSON.stringify(self.bookmarkToEdit));
			const apiUrl = $rootScope.configurationCurrentHost.rheticusAPI.host + '/monitor_group/'+
				bookmarkToEditCpy.m_monitor_group_entity.m_id;
			const monitorGroup = {
				monitor_group_month_interval : bookmarkToEditCpy.m_monitor_group_entity.m_month_interval,
				monitor_group_check: true,
				monitor_group_state: bookmarkToEditCpy.m_monitor_group_entity.m_state_bool ? 'active' : 'pause',
				monitor_group_threshold: Number(bookmarkToEditCpy.m_monitor_group_entity.m_threshold) * 10,
				monitor_group_persistence: bookmarkToEditCpy.m_monitor_group_entity.m_persistence,
				monitor_group_message: bookmarkToEditCpy.m_monitor_group_entity.m_message,
				monitor_group_last_measure_date_auto: true
			};
			$http.put(apiUrl, monitorGroup)
				.success(function(updatedMonitorGroup) {
					updatedMonitorGroup = updatedMonitorGroup.data;
					for(var i = 0; i < self.bookmarks.length; i++) {
						if(self.bookmarkToEdit.id === self.bookmarks[i].id) {
							self.bookmarks[i].m_monitor_group_entity = updatedMonitorGroup;
							bookmarkToEditBckp = self.bookmarks[i];
							break;
						}
					}
					$translate('monitorGroupSaved').then(function (translatedValue) {
						Flash.create("success", translatedValue);
					});
				})
				.error(function(){
					$translate('monitorGroupNotSaved').then(function (translatedValue) {
						Flash.create("danger", translatedValue);
					});
				});
		};

		var insertMonitorGroup = function() {
			const apiUrl = $rootScope.configurationCurrentHost.rheticusAPI.host + '/monitor_group';
			const bookmarkToEditCpy = JSON.parse(JSON.stringify(self.bookmarkToEdit));
			const monitorGroup = {
				monitor_group_month_interval : bookmarkToEditCpy.m_monitor_group_entity.m_month_interval,
				monitor_group_check: true,
				monitor_group_state: bookmarkToEditCpy.m_monitor_group_entity.m_state_bool ? 'active' : 'pause',
				monitor_group_threshold: Number(bookmarkToEditCpy.m_monitor_group_entity.m_threshold) * 10,
				monitor_group_persistence: bookmarkToEditCpy.m_monitor_group_entity.m_persistence,
				monitor_group_bookmark: bookmarkToEditCpy.id,
				monitor_group_last_measure_date_auto: true
			};
			$http.post(apiUrl, monitorGroup)
				.success(function(insertedMonitorGroup) {
					insertedMonitorGroup = insertedMonitorGroup.data;
					for(var i = 0; i < self.bookmarks.length; i++) {
						if(self.bookmarkToEdit.id === self.bookmarks[i].id) {
							self.bookmarks[i].m_monitor_group_entity = insertedMonitorGroup;
							bookmarkToEditBckp = self.bookmarks[i];
							break;
						}
					}
					$translate('monitorGroupSaved').then(function (translatedValue) {
						Flash.create("success", translatedValue);
					});
				})
				.error(function(){
					$translate('monitorGroupNotSaved').then(function (translatedValue) {
						Flash.create("danger", translatedValue);
					});
				});
		};

		var deleteMonitorGroup = function(id) {
			const apiUrl = $rootScope.configurationCurrentHost.rheticusAPI.host + '/monitor_group/'+id;
			$http.delete(apiUrl)
				.success(function() {
					bookmarkToEditBckp.m_monitor_group_entity = undefined;
					for(var i = 0; i < self.bookmarks.length; i++) {
						if(self.bookmarkToEdit.id === self.bookmarks[i].id) {
							self.bookmarks[i].m_monitor_group_entity = undefined;
							break;
						}
					}
					$translate('monitorGroupDeleted').then(function (translatedValue) {
						Flash.create("success", translatedValue);
					});
				})
				.error(function(){
					$translate('monitorGroupNotDeleted').then(function (translatedValue) {
						Flash.create("danger", translatedValue);
					});
				});
		};

		var validateBookmarkEdit = function() {
			return self.bookmarkToEdit.name && self.bookmarkToEdit.name.trim() && self.addBookmarkGeom;
		};

		var validateGroupMonitorEdit = function() {
			return ""+self.bookmarkToEdit.m_monitor_group_entity.m_threshold &&
				""+self.bookmarkToEdit.m_monitor_group_entity.m_threshold+"".trim() &&
				!Number.isNaN(Number(""+self.bookmarkToEdit.m_monitor_group_entity.m_threshold));
		};

		var monitorIdToDelete = undefined;
		var setEditBookmarkMonitorPanel = function(flag) {
			self.editBookmarkMonitorPanel = flag;
			if(!flag && self.bookmarkToEdit && self.bookmarkToEdit.m_monitor_group_entity.m_id) {
				monitorIdToDelete = self.bookmarkToEdit.m_monitor_group_entity.m_id;
				self.bookmarkToEdit.m_monitor_group_entity = {};
				self.bookmarkToEdit.m_monitor_group_entity.m_state_bool = true;
				self.bookmarkToEdit.m_monitor_group_entity.m_threshold = 1;
				self.bookmarkToEdit.m_monitor_group_entity.m_month_interval = 0;
				self.bookmarkToEdit.m_monitor_group_entity.m_persistence = 3;
			}
		};

		var setAddBookmarkMonitorPanel = function (flag) {
			self.addBookmarkMonitorPanel = flag;
		};

		var moveOnGeometry = function(geometry) {
			$scope.mapsIds.forEach(function(mapId){
				olData.getMap(mapId).then(function(map){
					const view = map.getView();
					var boundaryBox = ol.proj.transformExtent(new ol.extent.boundingExtent(geometry), 'EPSG:4326', 'EPSG:3857');
					view.fit(boundaryBox,  { size: map.getSize() });
				});
			});
		};

		var disableShowGeometry = function() {
			var geomIds = Object.keys(self.visibleGeometriesMap);
			if(geomIds.length > 0){
				geomIds.forEach(function(id){
					hideGeometryOnMap(id);
				});
				self.bookmarks.forEach(function(e){
					e.showGeometry = false;
				});
			}
			self.geomButtonDisabled = true;
		};
		var showBookmarkScattererDetails = function (bookmarkScatterer) {
			self.bookmarkScattererDetails = bookmarkScatterer;
		};

		var bookmarkScattererToEditBckp;
		var enterEditMode = function () {
			bookmarkScattererToEditBckp = self.bookmarkScattererDetails;
			self.bookmarkScattererToEdit = JSON.parse(JSON.stringify(self.bookmarkScattererDetails));
			self.bookmarkScattererDetails = undefined;
			if(self.bookmarkScattererToEdit.m_monitor_entity && self.bookmarkScattererToEdit.m_monitor_entity.m_id) {
				self.bookmarkScattererToEdit.m_monitor_entity.m_state_bool =
					self.bookmarkScattererToEdit.m_monitor_entity.m_state === 'active' ||
					self.bookmarkScattererToEdit.m_monitor_entity.m_state === 'triggered';
				// convert from mm to cm
				self.bookmarkScattererToEdit.m_monitor_entity.m_threshold /= 10;
				self.showBookmarkScattererMonitorPanel(true);
			} else {
				self.bookmarkScattererToEdit.m_monitor_entity = {};
				self.bookmarkScattererToEdit.m_monitor_entity.m_state_bool = true;
				self.bookmarkScattererToEdit.m_monitor_entity.m_month_interval = 0;
				self.bookmarkScattererToEdit.m_monitor_entity.m_threshold = 1;
				self.bookmarkScattererToEdit.m_monitor_entity.m_persistence = 3;
			}
		};

		var exitEditMode = function () {
			self.bookmarkScattererDetails = bookmarkScattererToEditBckp;
			self.bookmarkScattererToEdit = undefined;
			bookmarkScattererMonitorToDeleteId = undefined;
			self.showBookmarkScattererMonitorPanel(false);
		};

		var showBookmarkScattererMonitorPanel = function (flag) {
			self.editBookmarkScattererMonitorPanel = flag;
		};

		var validateBookmarkScattererName = function(name) {
			if(name && name.trim()){
				return true;
			} else {
				return false;
			}
		};

		var validateMonitor = function (persistence, threshold, interval) {
			persistence = "" + persistence;
			threshold = "" + threshold;
			interval = "" + interval;
			if(persistence && interval && threshold && threshold.trim() && !Number.isNaN(Number(threshold))) {
				return true;
			} else {
				return false;
			}
		};

		var insertMonitor = function (monitor, bookmarkScattererId) {
			const url = $rootScope.configurationCurrentHost.rheticusAPI.host + '/monitor';
			const reqBody = {
				'monitor_month_interval': monitor.m_month_interval,
				'monitor_check': true,
				'monitor_state': monitor.m_state_bool ? 'active' : 'pause',
				'monitor_threshold': monitor.m_threshold * 10,
				'monitor_persistence': monitor.m_persistence,
				'monitor_bookmark_scatterer': bookmarkScattererId,
				'monitor_last_measure_date_auto': true
			};
			$http.post(url, reqBody)
				.success(function(insertedMonitor) {
					bookmarkScattererToEditBckp.m_monitor_entity = insertedMonitor.data;
					$rootScope.$broadcast("reloadBookmarksScatterer");
					$translate('monitorSavedLabel').then(function (translatedValue) {
						Flash.create("success", translatedValue);
					});
				})
				.error(function () {
					$translate('monitorNotSavedLabel').then(function (translatedValue) {
						Flash.create("danger", translatedValue);
					});
				});
		};

		var updateMonitor = function (monitor) {
			const url = $rootScope.configurationCurrentHost.rheticusAPI.host + '/monitor/#monitorId'
				.replace('#monitorId', String(monitor.m_id));
			const reqBody = {
				'monitor_month_interval': monitor.m_month_interval,
				'monitor_check': true,
				'monitor_state': monitor.m_state_bool ? 'active' : 'pause',
				'monitor_threshold': monitor.m_threshold * 10,
				'monitor_persistence': monitor.m_persistence,
				'monitor_message': monitor.m_message,
				'monitor_last_measure_date_auto': true
			};
			$http.put(url, reqBody)
				.success(function (updatedMonitor) {
					bookmarkScattererToEditBckp.m_monitor_entity = updatedMonitor.data;
					$rootScope.$broadcast("reloadBookmarksScatterer");
					$translate('monitorSavedLabel').then(function (translatedValue) {
						Flash.create("success", translatedValue);
					});
				})
				.error(function () {
					$translate('monitorNotSavedLabel').then(function (translatedValue) {
						Flash.create("danger", translatedValue);
					});
				});
		};

		var deleteMonitor = function(id) {
			const url = $rootScope.configurationCurrentHost.rheticusAPI.host +
				'/monitor/#monitorId'.replace('#monitorId', String(id));
			$http.delete(url)
				.success(function (){
					bookmarkScattererToEditBckp.m_monitor_entity = undefined;
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

		var bookmarkScattererMonitorToDeleteId;
		var deleteBookmarkScattererToEditMonitor = function () {
			if(self.bookmarkScattererToEdit.m_monitor_entity.m_id) {
				bookmarkScattererMonitorToDeleteId = self.bookmarkScattererToEdit.m_monitor_entity.m_id;
				self.bookmarkScattererToEdit.m_monitor_entity = {};
				self.bookmarkScattererToEdit.m_monitor_entity.m_state_bool = true;
				self.bookmarkScattererToEdit.m_monitor_entity.m_month_interval = 0;
				self.bookmarkScattererToEdit.m_monitor_entity.m_threshold = 1;
				self.bookmarkScattererToEdit.m_monitor_entity.m_persistence = 3;
			}
			showBookmarkScattererMonitorPanel(false);
		};

		var saveEditedBookmarkScatterer = function () {
			var bookmarkScattererId;
			var bookmarkScattererName;
			var opPerformed = false;

			if(bookmarkScattererMonitorToDeleteId) {
				var monitorId = JSON.parse(JSON.stringify(bookmarkScattererMonitorToDeleteId));
				deleteMonitor(monitorId);
				bookmarkScattererMonitorToDeleteId = undefined;
				opPerformed = true;
			}

			if(!self.editBookmarkScattererMonitorPanel && validateBookmarkScattererName(self.bookmarkScattererToEdit.name)) {
				bookmarkScattererId = JSON.parse(JSON.stringify(self.bookmarkScattererToEdit.id));
				bookmarkScattererName = JSON.parse(JSON.stringify(self.bookmarkScattererToEdit.name));
				editBookmarkScatterer(bookmarkScattererId, bookmarkScattererName);
				opPerformed = true;
			} else if(!self.editBookmarkScattererMonitorPanel) {
				opPerformed = false;
			}
			if(self.editBookmarkScattererMonitorPanel &&
				validateBookmarkScattererName(self.bookmarkScattererToEdit.name) &&
				validateMonitor(self.bookmarkScattererToEdit.m_monitor_entity.m_persistence,
				self.bookmarkScattererToEdit.m_monitor_entity.m_threshold,
				self.bookmarkScattererToEdit.m_monitor_entity.m_month_interval)) {
				bookmarkScattererId = JSON.parse(JSON.stringify(self.bookmarkScattererToEdit.id));
				bookmarkScattererName = JSON.parse(JSON.stringify(self.bookmarkScattererToEdit.name));

				var bookmarkScattererMonitor = JSON.parse(JSON.stringify(self.bookmarkScattererToEdit.m_monitor_entity));
				editBookmarkScatterer(bookmarkScattererId, bookmarkScattererName);

				if(!self.bookmarkScattererToEdit.m_monitor_entity.m_id) {
					insertMonitor(bookmarkScattererMonitor, bookmarkScattererId);
				} else {
					updateMonitor(bookmarkScattererMonitor);
				}

				opPerformed = true;
			} else if(self.editBookmarkScattererMonitorPanel){
				opPerformed = false;
			}

			if(opPerformed) {
				exitEditMode();
			}
		};

		var showAreasList = function() {
			self.isAreasListVisible = true;
		};

		var hideAreasList = function() {
			self.isAreasListVisible = false;
		};

		var showBookmarksList = function() {
			self.isBookmarksListVisible = true;
		};

		var hideBookmarksList = function() {
			self.isBookmarksListVisible = false;
		};

		var showBookmarkScatterersList = function() {
			self.isBookmarkScatterersListVisible = true;
		};

		var hideBookmarkScatterersList = function() {
			self.isBookmarkScatterersListVisible = false;
		};

		/**
		 * EXPORT AS PUBLIC CONTROLLER
		 */
		angular.extend(self, {
			"ps": $scope.getOverlayParams("ps"),
			"ps_metadata": $scope.getOverlayMetadata("ps"),
			"iffi": $scope.getOverlayParams("iffi"),
			"iffi_metadata": $scope.getOverlayMetadata("iffi"),
			// "sentinel" : $scope.getOverlayParams("sentinel"),
			// "sentinel_metadata" : $scope.getOverlayMetadata("sentinel"),
			"psCandidate": $scope.getOverlayParams("psCandidate"),
			"psCandidate_metadata": $scope.getOverlayMetadata("psCandidate"),
			"cowiGelaNiscemi": $scope.getOverlayParams("cowiGelaNiscemi"),
			"cowiGelaNiscemi_metadata": $scope.getOverlayMetadata("cowiGelaNiscemi"),

			"userDeals": $scope.getUserDeals(),
			"userDealsDistinct": [],
			"checkboxActive": "prova",

			"search": "",
			"filteredAreas": [],
			"filterSelectedAreas": filterSelectedAreas
		});
		angular.extend(self, {
			//Tab controls
			"isCollapsed": true, // not minimize
			"minimize": minimize,
			//PS
			"show_panel_ps": true,
			"show_panel_ps_aoi": false,
			"view_overlay_ps": self.ps.visible, // overlay visibility
			"ps_layer_visibility_text": self.ps.visible ? "Layer off" : "Layer on",
			"switchOverlayPs": switchOverlayPs,
			"viewPanelPs": viewPanelPs,
			"viewPanelPsProviders": viewPanelPsProviders,
			"viewPanelPsAoi": viewPanelPsAoi,
			"updateSelectionArea": updateSelectionArea,
			//IFFI
			"show_panel_iffi": false,
			"view_overlay_iffi": self.iffi.visible,
			"iffi_layer_visibility_text": self.iffi.visible ? "Layer off" : "Layer on",
			"switchOverlayIffi": switchOverlayIffi,
			"viewPanelIffi": viewPanelIffi,
			//PSCANDIDATE
			"show_panel_psCandidate": false,
			"view_overlay_psCandidate": self.psCandidate.visible,
			"psCandidate_layer_visibility_text": self.psCandidate.visible ? "Layer off" : "Layer on",
			"switchOverlaypsCandidate": switchOverlaypsCandidate,
			"viewPanelpsCandidate": viewPanelpsCandidate,
			//SENTINEL
			// "show_panel_sentinel" : false,
			// "view_overlay_sentinel" : self.sentinel.visible,
			// "sentinel_layer_visibility_text" : self.sentinel.visible ? "Layer off" : "Layer on",
			// "switchOverlaySentinel" : switchOverlaySentinel,
			// "viewPanelSentinel" : viewPanelSentinel

			//COWI GELA-NISCEMI DEMO
			"show_panel_cowiGelaNiscemi": false,
			"view_overlay_cowiGelaNiscemi": self.cowiGelaNiscemi.visible,
			"cowiGelaNiscemi_layer_visibility_text": self.cowiGelaNiscemi.visible ? "Layer off" : "Layer on",
			"switchOverlayCowiGelaNiscemi": switchOverlayCowiGelaNiscemi,
			"viewPanelCowiGelaNiscemi": viewPanelCowiGelaNiscemi,

			//BOOKMARK
			"bookmarks": bookmarks,
			"bookmarkCount": bookmarkCount,
			"disableBookmarksControls": disableBookmarksControls,
			"addBookmark": addBookmark,
			"moveToBookmark": moveToBookmark,
			"deleteBookmark": deleteBookmark,
			"renameBookmark": renameBookmark,
			"keyPressed": keyPressed,
			"startEditingBookmark": startEditingBookmark,
			"getBookmarkName": getBookmarkName,
			"filteredBookmarks": [],
			"startEditBookmarkScatterer": startEditBookmarkScatterer,
			"keyPressedEditBookmarkScatterer": keyPressedEditBookmarkScatterer,
			"editBookmarkScatterer": editBookmarkScatterer,
			"deleteBookmarkScatterer": deleteBookmarkScatterer,
			"moveToBookmarkScatterer": moveToBookmarkScatterer,
			"shareBookmarkScattererLocation": shareBookmarkScattererLocation,
			"addBookmarkMode": false,
			"setAddBookmarkMode": setAddBookmarkMode,
			"editBookmarkMonitorPanel": false,
			"initDrawInteraction": initDrawInteraction,
			"drawBox": drawBox,
			"drawPolygon": drawPolygon,
			"saveBookmark": saveBookmark,
			"addBookmarkName": undefined,
			"addBookmarkGeom": undefined,
			"olSphere": new ol.Sphere(6378137),
			"groupMonitorDisabled": true,
			"exitAddBookmarkMode": exitAddBookmarkMode,
			"groupMonitorInterval": 0,
			"groupMonitorPersistence": 3,
			"groupMonitorStateBool": true,
			"groupMonitorThreshold": 1,
			"showBookmarkGeometry": showBookmarkGeometry,
			"visibleGeometriesMap": {},
			"showBookmarkDetails": showBookmarkDetails,
			"getGeometryArea": getGeometryArea,
			"detailedBookmark": undefined,
			"editBookmarkMode": false,
			"setEditBookmarkMode": setEditBookmarkMode,
			"bookmarkToEdit": undefined,
			"hideBookmarkDetails": hideBookmarkDetails,
			"saveEditedBookmark": saveEditedBookmark,
			"setEditBookmarkMonitorPanel": setEditBookmarkMonitorPanel,
			"setAddBookmarkMonitorPanel": setAddBookmarkMonitorPanel,
			"addBookmarkMonitorPanel": false,
			"selectVisibleArea": selectVisibleArea,
			"geomButtonDisabled": false,
			"filterBookmarkScatterersByMonitorState": filterBookmarkScatterersByMonitorState,
			"showBookmarkScattererDetails": showBookmarkScattererDetails,
			"bookmarkScattererDetails": undefined,
			"bookmarkScattererToEdit": undefined,
			"enterEditMode": enterEditMode,
			"exitEditMode": exitEditMode,
			"editBookmarkScattererMonitorPanel": false,
			"showBookmarkScattererMonitorPanel": showBookmarkScattererMonitorPanel,
			"saveEditedBookmarkScatterer": saveEditedBookmarkScatterer,
			"deleteBookmarkScattererToEditMonitor": deleteBookmarkScattererToEditMonitor,
			"tooManyScatterer": false,
			"extensionTooLarge": false,
			"disabledMonitorTooltip": undefined,
			"showAllGeometries": showAllGeometries,
			"hideAllGeometries": hideAllGeometries,
			"showAllGeometriesFlag": false,
			"showAreasList": showAreasList,
			"hideAreasList": hideAreasList,
			"isAreasListVisible": true,
			"showBookmarksList": showBookmarksList,
			"hideBookmarksList": hideBookmarksList,
			"isBookmarksListVisible": true,
			"showBookmarkScatterersList": showBookmarkScatterersList,
			"hideBookmarkScatterersList": hideBookmarkScatterersList,
			"isBookmarkScatterersListVisible": true
		});

		$scope.$on("setSwitchPanelUserDeals", function (event, args) { // jshint ignore:line
			self.userDeals = args.userDeals;
		});

		/**
		 * PRIVATE VARIABLES AND METHODS
		 */
		var toggleOverlay = function (overlay) {
			var visibility = eval("self.view_overlay_" + overlay + ";"); // jshint ignore:line
			if (!visibility) {
				eval("self." + overlay + "_layer_visibility_text = \"Layer off\";"); // jshint ignore:line
			} else {
				eval("self." + overlay + "_layer_visibility_text = \"Layer on\";"); // jshint ignore:line
			}
			eval("self.view_overlay_" + overlay + " = !self.view_overlay_" + overlay + ";"); // jshint ignore:line
			eval("self." + overlay + ".visible = self.view_overlay_" + overlay + ";"); // jshint ignore:line
		};
		var viewPanel = function (panel) {
			self.show_panel_ps_aoi = false;
			self.show_panel_iffi = false;
			// self.show_panel_sentinel = false;
			self.show_panel_psCandidate = false;
			self.show_panel_ps = false;
			eval("self.show_panel_" + panel + " = true;"); // jshint ignore:line
		};
	}]);
