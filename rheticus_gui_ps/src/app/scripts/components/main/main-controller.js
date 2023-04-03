'use strict';

/**
 * @ngdoc function
 * @name rheticus.controller:MainCtrl
 * @description
 * # MainCtrl
 * Main Controller for rheticus project
 */
angular.module('rheticus')
    .controller('MainCtrl', ['$rootScope', '$scope', 'configuration', '$translate', '$http', 'olData', 'ArrayService', 'SpatialService', 'Flash', '$window', '$location', '$route', 'AuthenticationService',
        function ($rootScope, $scope, configuration, $translate, $http, olData, ArrayService, SpatialService, Flash, $window, $location, $route, AuthenticationService) {
            var self = this; //this controller
            $rootScope.main = self;

            var filterMap1 = function(value, index, array){
                if(value.active == true && value.name != "PlanetScope_map2"){
                    return true;
                }
                else{
                    return false;
                }
            };

            var filterMap2 = function(value, index, array){
                if(value.active == true && value.name != "PlanetScope_map1"){
                    return true;
                }
                else{
                    return false;
                }
            };

            var map2Visibility = false;

            var mapMode = {
                "default": true,
                "multiple": false,
                "swiper": false
            };

            var screenSize = {
                "height": {
                    "int": null,
                    "px": null
                },
                "width": {
                    "int": null,
                    "px": null
                }
            };

            var multipleMapSize = {
                "height": {
                    "int": null,
                    "px": null
                },
                "width": {
                    "int": null,
                    "px": null
                }
            };

            var swiperSize = {
                "height": {
                    "int": null,
                    "px": null
                },
                "width": {
                    "int": null,
                    "px": null
                }
            };

            var swiperId = document.getElementById("swiper");

            var getWindowSize = function(){
                return {
                    "height": window.innerHeight,
                    "width": window.innerWidth
                }
            };

            var urlLatParam = parseFloat($location.search().lat);
            var urlLonParam = parseFloat($location.search().lon);
            var urlZoomParam = parseInt($location.search().zoom);
            var preventReload = false;
            // bookmark scatterer info for open a shared position
            var openPsTrendsFlag = $location.search().openPsPan;

            /**
             * This watch monitors url to detect params needed to open
             * Ps Trends Panel for a shared Bookmark Scatterer
             */
            $scope.$watch(function (){
                return $location.search().openPsPan;
            }, function (open){
                if (open && !openPsTrendsFlag) {
                    var bookmarkScattererLat = parseFloat($location.search().lat);
                    var bookmarkScattererLon = parseFloat($location.search().lon);
                    if(bookmarkScattererLat && bookmarkScattererLon){
                        $scope.setCenter({
                            lat: bookmarkScattererLat,
                            lon: bookmarkScattererLon,
                            zoom: 20
                        });
                       setTimeout(function(){
                           $rootScope.$broadcast("openPsTrends", [bookmarkScattererLon, bookmarkScattererLat]);
                       }, 1000);
                    }
                } else if(openPsTrendsFlag){
                    openPsTrendsFlag = undefined;
                }

                $location.search('openPsPan', null);
            });

            $scope.$on('$routeUpdate', function ($event, next, current) {
                if (self.preventReload) {
                    $event.preventDefault();
                    self.preventReload = false;
                }
            });

            var lastInfo = 'rainfall';

            var setCrossOrigin = function () { // Review "CrossOrigin" openlayers parameter from overlays configuration
                var overlays = $rootScope.configurationCurrentHost.layers.overlays.olLayers;
                for (var o = 0; o < overlays.length; o++) {
                    overlays[o].source.crossOrigin = (overlays[o].source.crossOrigin && (overlays[o].source.crossOrigin === "null")) ? null : "";
                }
                return overlays;
            };
            var overlays = setCrossOrigin();

            /**
             * PUBLIC VARIABLES AND METHODS
             */
            // OpenLayers Default Events
            var olDefaults = {
                "events": {
                    "map": ["moveend", "click"],
                    "layers": ["click"]
                },
                "interactions": {
                    "mouseWheelZoom": true
                },
                "view": configuration.map.view,
                "center": configuration.map.center
            };

            if (urlLatParam && urlLonParam) {
                olDefaults.center.lat = urlLatParam;
                olDefaults.center.lon = urlLonParam;
                // check if the shared location requires to open a Ps Trends Panel for a bookmark scatterer
                if(openPsTrendsFlag){
                    olDefaults.center.zoom = 20;
                    setTimeout(function(){
                        $rootScope.$broadcast("openPsTrends", [urlLonParam, urlLatParam]);
                    }, 1500);
                } else if(!isNaN(urlZoomParam)){
                    olDefaults.center.zoom = urlZoomParam;
                }
            }

            // Openlayers controls
            var olControls = [
                //{"name" : 'zoom', "active" : true}, // TBC ...duplicate in view
                { "name": 'rotate', "active": true },
                { "name": 'zoomtoextent', "active": false },
                //{"name" : 'zoomslider', "active" : true},
                { "name": 'scaleline', "active": true },
                { "name": 'attribution', "active": true }
            ];
            //External Controller management : GETTER and SETTER
            var setController = function (openController) {
                activeController = (activeController === openController) ? "" : openController;
            };
            var getController = function (openController) {
                return activeController === openController;
            };
            //Setter map view center
            var setCenter = function (center) {
                $scope.center.lon = (center.lon && !isNaN(center.lon)) ? center.lon : $scope.center.lon;
                $scope.center.lat = (center.lat && !isNaN(center.lat)) ? center.lat : $scope.center.lat;
                $scope.center.zoom = (center.zoom && !isNaN(center.zoom)) ? center.zoom : $scope.center.zoom;
            };

            // Setter map view extent on GeoJSON bounds
            var setMapViewExtent = function (geometryType, geoJSON) {
                if (geometryType && (geometryType !== "") && geoJSON && (geoJSON !== null)) {
                    var geom = eval("new ol.geom." + geometryType + "(geoJSON);"); // jshint ignore:line
                    var extent = geom.getExtent();
                    extent = ol.extent.applyTransform(extent, ol.proj.getTransform("EPSG:4326", configuration.map.view.projection)); // jshint ignore:line
                    $scope.mapsIds.forEach(function(id){
                        olData.getMap(id).then(function (map) {
                            map.getView().fit(extent, map.getSize(), { constrainResolution: false });
                        });
                    });
                }
            };
            //Getter overlay ols parameters
            var getOverlayParams = function (id) {
                return getOverlay("overlays", id);
            };
            //Getter overlay config metadata
            var getOverlayMetadata = function (id) {
                return getOverlay("metadata", id);
            };
            // check on zoom level to enable getFeatureInfo query on PS
            var showDetails = function () {
                return $scope.center.zoom >= configuration.map.query.zoom;
            };
            //Getter active baselayer useful for basemap controller
            var getActiveBaselayer = function () {
                return self.baselayers[ArrayService.getIndexByAttributeValue(self.baselayers, "active", true)];
            };
            var getBaselayers = function () {
                return self.baselayers;
            };
            var getOverlays = function () {
                return self.overlays;
            };
            var userDeals = [];
            var getUserDeals = function () {
                return userDeals;
            };
            var setSentinelExtent = function (geojson) {
                getOverlayParams("sentinel").source = {
                    "type": "GeoJSON",
                    "geojson": {
                        //"projection": "EPSG:4326",
                        //"projection": configuration.map.view.projection,
                        "object": {
                            "type": "FeatureCollection",
                            "features": [{
                                "type": "Feature",
                                "id": "sentinel",
                                "properties": {
                                    "name": "Sentinel"
                                },
                                "geometry": {
                                    "type": "MultiPolygon",
                                    "coordinates": geojson
                                }
                            }]
                        }
                    }
                };
                if (getFeatureInfoPoint.length > 0 && geojson.length > 0) {
                    setCenter({
                        "lon": getFeatureInfoPoint[0],
                        "lat": getFeatureInfoPoint[1],
                        "zoom": 7
                    });
                }
            };

            var setDataProviders = function () {
                var i = 0;
                $scope.dataProviders = setUserDataProviders();
                for (i = 0; i < userDeals.length; i++) {
                    var index = ArrayService.getIndexByAttributeValue($scope.dataProviders, "id", userDeals[i].sensorid.name);
                    if (index !== -1) {
                        $scope.dataProviders[index].disabled = false;
                        $scope.dataProviders[index].checked = true;
                    }
                    // } else {
                    //     $scope.dataProviders[index].checked = false;
                    //     $scope.dataProviders[index].disabled = true;
                    // }
                }
                $scope.$broadcast("setDataProvidersOnFilter");
            };
            var setDataProviderFilter = function () {
                var cqlFilter = "";
                var i = 0;
                for (i = 0; i < $scope.dataProviders.length; i++) {
                    if (!$scope.dataProviders[i].disabled && !$scope.dataProviders[i].checked) {
                        if (cqlFilter !== "") {
                            cqlFilter += " AND ";
                        }
                        cqlFilter += "(sensorid<>'" + $scope.dataProviders[i].id + "')";
                    }
                }
                advancedCqlFilters.dataProvider = (cqlFilter !== "") ? cqlFilter : "";
            };

            //CQL_FILTER SETTER ON "COHERENCE" PS ATTRIBUTE
            var setCoherenceModelFilter = function (range) {
                if (!$rootScope.normalizeCoherenceFlag) {
                    $scope.$broadcast("setFeatureInfoClosure");
                    $scope.$broadcast("setPsTrendsClosure");
                    $scope.$broadcast("setTimelineClosure");
                    if (range === undefined) {
                        range = $scope.coherenceModel.init;
                    }

                    if ($rootScope.period == "g") {
                        self.accelerationField = "g_an";
                        self.velocityField = "g_v";
                    } else if ($rootScope.period == "ly") {
                        self.accelerationField = "ly_an";
                        self.velocityField = "ly_v";
                    }
                    self.coherenceField = "coherence";

                    advancedCqlFilters.coherence = "";

                    for (var i = 0; i < range.length; i = i + 2) {
                        if (advancedCqlFilters.coherence !== "") {
                            advancedCqlFilters.coherence += " OR ";
                        }
                        var low = range[i];
                        var high = range[i + 1];

                        var min = "";
                        if (low !== $scope.coherenceModel.from) {
                            min = self.coherenceField + ">=" + low / 100;
                        }

                        var max = "";
                        if (high !== $scope.coherenceModel.to) {
                            max = self.coherenceField + "<=" + high / 100;
                        }

                        advancedCqlFilters.coherence += getCqlTextRange(min, max);
                    }
                    if (advancedCqlFilters.coherence !== "") {
                        advancedCqlFilters.coherence = "(" + advancedCqlFilters.coherence + ")";
                    }

                } else {
                    advancedCqlFilters.coherence = "";
                }
            };

            //CQL_FILTER SETTER ON "COHERENCE_NORM" PS ATTRIBUTE
            var setCoherenceNormModelFilter = function (range) {
                if ($rootScope.normalizeCoherenceFlag) {
                    $scope.$broadcast("setFeatureInfoClosure");
                    $scope.$broadcast("setPsTrendsClosure");
                    $scope.$broadcast("setTimelineClosure");
                    if (range === undefined) {
                        range = $scope.coherenceNormModel.init;
                    }

                    if ($rootScope.period == "g") {
                        self.accelerationField = "g_an";
                        self.velocityField = "g_v";
                    } else if ($rootScope.period == "ly") {
                        self.accelerationField = "ly_an";
                        self.velocityField = "ly_v";
                    }

                    self.coherenceNormField = "coherence_norm";

                    advancedCqlFilters.coherence_norm = "";

                    for (var i = 0; i < range.length; i = i + 2) {
                        if (advancedCqlFilters.coherence_norm !== "") {
                            advancedCqlFilters.coherence_norm += " OR ";
                        }
                        var low = range[i];
                        var high = range[i + 1];

                        var min = "";
                        if (low !== $scope.coherenceNormModel.from) {
                            min = self.coherenceNormField + ">=" + low / 100;
                        }

                        var max = "";
                        if (high !== $scope.coherenceNormModel.to) {
                            max = self.coherenceNormField + "<=" + high / 100;
                        }

                        advancedCqlFilters.coherence_norm += getCqlTextRange(min, max);
                    }
                    if (advancedCqlFilters.coherence_norm !== "") {
                        advancedCqlFilters.coherence_norm = "(" + advancedCqlFilters.coherence_norm + ")";
                    }

                } else {
                    advancedCqlFilters.coherence_norm = "";
                }
            };

            //CQL_FILTER SETTER ON "VELOCITY" PS ATTRIBUTE
            var setSpeedModelFilter = function (range) {
                if (range === undefined) {
                    range = $scope.speedModel.init;
                }

                self.velocityRange = range;

                if ($rootScope.period == "g") {
                    self.accelerationField = "g_an";
                    self.velocityField = "g_v";
                } else if ($rootScope.period == "ly") {
                    self.accelerationField = "ly_an";
                    self.velocityField = "ly_v";
                }


                advancedCqlFilters.velocity = "";

                for (var i = 0; i < range.length; i = i + 2) {
                    if (advancedCqlFilters.velocity !== "") {
                        advancedCqlFilters.velocity += " OR ";
                    }
                    var low = range[i];
                    var high = range[i + 1];

                    var min = "";
                    if (low !== $scope.speedModel.from) {
                        min = self.velocityField + ">=" + low;
                    }

                    var max = "";
                    if (high !== $scope.speedModel.to) {
                        max = self.velocityField + "<=" + high;
                    }

                    advancedCqlFilters.velocity += getCqlTextRange(min, max);
                }

                if (advancedCqlFilters.velocity !== "") {
                    advancedCqlFilters.velocity = "(" + advancedCqlFilters.velocity + ")";
                }
            };

            //CQL_FILTER SETTER ON "ACCELERATION_NORM" PS ATTRIBUTE
            var setAccelerationModelFilter = function (range) {
                if (range === undefined) {
                    range = $scope.accelerationModel.init;
                }

                self.accelerationNormRange = range;

                if ($rootScope.period == "g") {
                    self.accelerationField = "g_an";
                    self.velocityField = "g_v";
                } else if ($rootScope.period == "ly") {
                    self.accelerationField = "ly_an";
                    self.velocityField = "ly_v";
                }

                advancedCqlFilters.acceleration_norm = "";

                for (var i = 0; i < range.length; i = i + 2) {
                    if (advancedCqlFilters.acceleration_norm !== "") {
                        advancedCqlFilters.acceleration_norm += " OR ";
                    }
                    var low = range[i];
                    var high = range[i + 1];

                    var min = "";
                    if (low !== $scope.accelerationModel.from) {
                        min = self.accelerationField + ">=" + low / 100;
                    }

                    var max = "";
                    if (high !== $scope.accelerationModel.to) {
                        max = self.accelerationField + "<=" + high / 100;
                    }

                    advancedCqlFilters.acceleration_norm += getCqlTextRange(min, max);
                }
                if (advancedCqlFilters.acceleration_norm !== "") {
                    advancedCqlFilters.acceleration_norm = "(" + advancedCqlFilters.acceleration_norm + ")";
                }
            };

            //CQL PASS FILTER
            var setPassFilter = function (passes) {
                var keys = _.keys(passes);
                var pss = _.filter(keys, function (elm) {
                    return passes[elm].checked;
                });
                var pss2str = _.map(pss, function (elm) {
                    return "'" + elm + "'";
                })
                advancedCqlFilters.pass = "pass IN (" + _.join(pss2str) + ")";
            }

            var applyFiltersToMap = function (force) {
                var cqlFilter = null;
                for (var key in advancedCqlFilters) {
                    if (advancedCqlFilters.hasOwnProperty(key) && (advancedCqlFilters[key] !== "")) {
                        if (cqlFilter !== null) {
                            cqlFilter += " AND "; //Add "AND" condition with prevoius item
                        } else {
                            cqlFilter = ""; //initialize as empty String
                        }
                        cqlFilter += advancedCqlFilters[key]; //Add new condition to cqlFilter
                    }
                }
                getOverlayParams("ps").source.params.CQL_FILTER = cqlFilter;
            };

            var setDefaultDataProviders = function () { // PS dataProviders filter
                var dp = [];
                for (var i = 0; i < configuration.dataProviders.length; i++) {
                    dp.push(ArrayService.cloneObj(configuration.dataProviders[i]));
                }
                return dp;
            };

            var setUserDataProviders = function () {
                var userDeals = getUserDeals();
                var userDataProviders = [];
                var userDealsMap = {};
                userDeals.forEach(function (element) {
                    const sensor = element.sensorid;
                    if (!(sensor.name.toLowerCase() in userDealsMap)) {
                        userDealsMap[sensor.name.toLowerCase()] = true;
                        const dataProviderObj = {};
                        dataProviderObj.disabled = true;
                        dataProviderObj.checked = false;
                        dataProviderObj.id = sensor.name;
                        dataProviderObj.description = sensor.description;
                        userDataProviders.push(dataProviderObj);
                    }
                });
                return userDataProviders;
            };

            var setVelocityField = function (value) {
                self.velocityField = value;
            };
            var getVelocityField = function () {
                return self.velocityField;
            };

            var setCoherenceField = function (value) {
                self.coherenceField = value;
            };
            var getCoherenceField = function () {
                return self.coherenceField;
            };

            var setCoherenceNormField = function (value) {
                self.coherenceNormField = value;
            };
            var getCoherenceNormField = function () {
                return self.coherenceNormField;
            };

            var setAccelerationField = function (value) {
                self.accelerationField = value;
            };
            var getAccelerationField = function () {
                return self.accelerationField;
            };


            var downloadTile = function (tile, src) {
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.addEventListener('loadend', function (evt) {
                    var data = this.response;
                    if (data !== undefined) {
                        var blobUrl = URL.createObjectURL(data);
                        self.tileMap.push({ src: src, blobUrl: blobUrl });
                        if (self.tileMap.length > self.maxMemory / self.tileSize) {
                            URL.revokeObjectURL(self.tileMap[0].blobUrl);
                            self.tileMap.shift();
                        }
                        tile.getImage().src = blobUrl;
                    } else {
                        tile.setState(TileState.ERROR);
                    }
                });
                xhr.addEventListener('error', function () {
                    tile.setState(TileState.ERROR);
                });
                xhr.open('GET', src);
                xhr.setRequestHeader("Authorization", "Basic " + $rootScope.login.details.geoserver_authdata);
                xhr.send();
            }

            //https://github.com/openlayers/openlayers/blob/1035ba7bf2285ca5842505b5bdf5ec28ab62b64f/src/ol/Tile.js#L10
            // we also need to handle caching ourselves

            var basicAuthTileLoadFunction = function (tile, src) {
                var cachedTile = self.tileMap.find(
                    function (el) {
                        return el.src === src;
                    });
                if (cachedTile) {
                    tile.getImage().src = cachedTile.blobUrl;
                } else {
                    downloadTile(tile, src);
                }
            };

            var copyUrlWithLocation = function () {
                var copyText = document.getElementById('linkToCopy');
                olData.getMap('map-default').then(function (map) {
                    var lonlat = ol.proj.transform(map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326');
                    var zoom = map.getView().getZoom();
                    copyText.value = $location.absUrl().split('?')[0] +
                        '?lat=' + lonlat[1] + '&lon=' + lonlat[0] + '&zoom=' + zoom + '&fromExt=true';
                    copyText.select();
                    try {
                        document.execCommand('copy');
                    } catch (err) {
                        console.log('Oops, unable to copy');
                    }
                });
            };

            var copyBookmarkScattererLocation = function (lonlat) {
                var copyText = document.getElementById('linkToCopy');
                olData.getMap('map-default').then(function () {
                    copyText.value = $location.absUrl().split('?')[0] +
                        '?openPsPan=true&lat=' + lonlat[1] + '&lon=' + lonlat[0]+'&fromExt=true';
                    copyText.select();
                    try {
                        document.execCommand('copy');
                    } catch (err) {
                        console.log('Oops, unable to copy');
                    }
                });
            };

            $rootScope.$on("actionOnSidenav", function(evt, object){
                closeBefore(object);
                self.selectedSidenav = object.sidenav;
                self.isSidenavOpen = object.open;
            });

            var closeBefore = function(object) {
                if(self.isSidenavOpen && object.open && self.selectedSidenav !== object.sidenav) {
                    self.isSidenavOpen = false;
                    self.selectedSidenav = undefined;
                }
            };

            olData.getMap('map-default').then(function(map){
                setTimeout(function(){
                    map.updateSize();
                }, 600);
            });

            var dragElement = function (elmnt) {
                var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

                elmnt.onmousedown = dragMouseDown;

                function dragMouseDown(e) {
                    e = e || window.event;
                    e.preventDefault();
                    // get the mouse cursor position at startup:
                    pos3 = e.clientX;
                    //pos4 = e.clientY;
                    document.onmouseup = closeDragElement;
                    // call a function whenever the cursor moves:
                    document.onmousemove = elementDrag;
                }

                var d;

                function elementDrag(e) {
                    e = e || window.event;
                    e.preventDefault();
                    // calculate the new cursor position:
                    pos1 = pos3 - e.clientX;
                    pos3 = e.clientX;

                    d = (elmnt.offsetLeft - pos1)
                    // set the element's new position:

                    if(d > self.getWindowSize().width*0.1 && d < self.getWindowSize().width*0.9){
                        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
                        self.swiperSize.width.int = d;
                        self.swiperSize.width.px = d + "px";
                    }

                    $rootScope.$digest();
                }

                function closeDragElement() {
                    // stop moving when mouse button is released:
                    document.onmouseup = null;
                    document.onmousemove = null;
                }
            };

            dragElement(swiperId);

            /**
             * EXPORT AS PUBLIC CONTROLLER
             */
            angular.extend(self, {
                "olDefaults": olDefaults,
                "controls": olControls,
                "view": {}, // Openlayers view
                "marker": {}, // OpenLayers Marker layer for PS query
                "baselayers": $rootScope.configurationCurrentHost.layers.baselayers,
                "overlays": overlays, // overlay layer list
                "metadata": $rootScope.configurationCurrentHost.layers.overlays.metadata, // overlay layer list
                "velocityFieldGlobal": "g_v",
                "velocityFieldLastYear": "ly_v",
                "coherenceField": "coherence",
                "coherenceNormField": "coherence_norm",
                "accelerationFieldGlobal": "g_a",
                "accelerationFieldLastYear": "ly_a",
                "maxMemory": 500000, //500 MB
                "tileSize": 50, //50 KB
                "tileMap": [],
                "downloadTile": downloadTile,
                "basicAuthTileLoadFunction": basicAuthTileLoadFunction,
                "isSidenavOpen": false,
                "selectedSidenav": undefined,
                "filterMap1": filterMap1,
                "filterMap2": filterMap2,
                "map2Visibility": map2Visibility,
                "mapMode": mapMode,
                "swiperSize": swiperSize,
                "swiperId": swiperId,
                "screenSize": screenSize,
                "multipleMapSize": multipleMapSize,
                "dragElement": dragElement,
                "getWindowSize": getWindowSize
            });

            /**
             * EXPORT AS PUBLIC SCOPE
             */
            angular.extend($scope, {
                // externalized scope variables for watchers
                "speedModel": ArrayService.cloneObj(configuration.filters.speedSlider), // PS speed filter
                "coherenceModel": ArrayService.cloneObj(configuration.filters.coherenceSlider), // PS coherence filter
                "coherenceNormModel": ArrayService.cloneObj(configuration.filters.coherenceNormSlider), // PS coherence normalized filter
                "accelerationModel": ArrayService.cloneObj(configuration.filters.accelerationSlider), // PS acceleration filter
                "passModel": ArrayService.cloneObj(configuration.filters.passFilter),
                "dataProviders": setDefaultDataProviders(),
                "iffi": null, // IFFI overlay getFeatureInfoResponse
                "sentinel": null, // SENTINEL overlay getFeatureInfoResponse
                "ps": null, // PS overlay getFeatureInfoResponse
                "cowiGelaNiscemi": null, // COWI Gela-Niscemi overlay getFeatureInfoResponse
                "center": configuration.map.center, // for scope watcher reasons because "ols moveend event" makes ols too slow!
                // externalized scope methods for children controllers
                "setController": setController,
                "getController": getController,
                "setMapViewExtent": setMapViewExtent,
                "setCenter": setCenter,
                "getOverlayParams": getOverlayParams,
                "getOverlayMetadata": getOverlayMetadata,
                "showDetails": showDetails,
                "getActiveBaselayer": getActiveBaselayer,
                "getBaselayers": getBaselayers,
                "getOverlays": getOverlays,
                "getUserDeals": getUserDeals,
                "setSentinelExtent": setSentinelExtent,
                "setDataProviderFilter": setDataProviderFilter,
                "applyFiltersToMap": applyFiltersToMap,
                "setVelocityField": setVelocityField,
                "setSpeedModelFilter": setSpeedModelFilter,
                "setCoherenceModelFilter": setCoherenceModelFilter,
                "setCoherenceNormModelFilter": setCoherenceNormModelFilter,
                "setAccelerationModelFilter": setAccelerationModelFilter,
                "setPassFilter": setPassFilter,
                "getVelocityField": getVelocityField,
                "copyUrlWithLocation": copyUrlWithLocation,
                "copyBookmarkScattererLocation": copyBookmarkScattererLocation,
                "mapsIds": [
                    "map-default",
                    "map-multiple-left",
                    "map-multiple-right",
                    "map-swiper-right",
                    "map-swiper-left"
                ]
            });

            /**
             * WATCHERS
             */

            //period watcher for adjusting wms request 
            $rootScope.$watch("period", function () {
                if ($rootScope.period == "g") {
                    getOverlayParams("ps").source.params.STYLES = "rheticus_displacement_global:velocity";
                } else if ($rootScope.period == "ly") {
                    getOverlayParams("ps").source.params.STYLES = "rheticus_displacement_global:velocity_ly";
                }
            });

            //speedModel init watcher for adjusting CQL_FILTER view source parameter
            $scope.$watch("speedModel.init", function (range) {
                setSpeedModelFilter(range);
                applyFiltersToMap();
            });
            //coherenceModel init watcher for adjusting CQL_FILTER view source parameter
            $scope.$watch("coherenceModel.init", function (range) {
                setCoherenceModelFilter(range);
                applyFiltersToMap();
            });
            //coherenceNormModel init watcher for adjusting CQL_FILTER view source parameter
            $scope.$watch("coherenceNormModel.init", function (range) {
                setCoherenceNormModelFilter(range);
                applyFiltersToMap();
            });
            //accelerationModel init watcher for adjusting CQL_FILTER view source parameter
            $scope.$watch("accelerationModel.init", function (range) {
                setAccelerationModelFilter(range);
                applyFiltersToMap();
            });
            //delete marker when status changes to false
            $rootScope.$watch("markerVisibility", function (visible) {
                if (!visible) {
                    initMarker();
                }
            });

            //Speed Single Flag
            $rootScope.$watch("speedSingleFlag", function (flag) {
                setSpeedModelFilter();
                applyFiltersToMap(true);
            });

            //normalized Coherence Flag
            $rootScope.$watch("normalizeCoherenceFlag", function (flag) {
                setCoherenceNormModelFilter();
                setCoherenceModelFilter();
                applyFiltersToMap(true);
            });

            //accelerationModel init watcher for adjusting CQL_FILTER view source parameter
            $scope.$watch("passModel.init", function (value) {
                setPassFilter(value);
                applyFiltersToMap();
            });

            var setDefaultDisplacementFilters = function () {
                //reset cql filer main controller settings
                resetAdvancedCqlFilters();

                // set default advanced slider filter
                //SPEED
                $scope.speedModel.init = configuration.filters.speedSlider.init;
                setSpeedModelFilter($scope.speedModel.init);

                //COHERENCE
                $scope.coherenceModel.init = configuration.filters.coherenceSlider.init;
                setCoherenceModelFilter($scope.coherenceModel.init);

                //COHERENCE NORMALIZED
                $scope.coherenceNormModel.init = configuration.filters.coherenceNormSlider.init;
                setCoherenceNormModelFilter($scope.coherenceNormModel.init);

                //ACCELERATION
                $scope.accelerationModel.init = configuration.filters.accelerationSlider.init;
                setAccelerationModelFilter($scope.accelerationModel.init);

                //PASS FILTER
                $scope.passModel.init = configuration.filters.passFilter.init;
                $scope.passModel.init.A.checked = true;
                $scope.passModel.init.D.checked = true;
                setPassFilter($scope.passModel.init);

                //Setting user data providers
                setDataProviders();

                // apply above filters to current map for refresh
                applyFiltersToMap();
            };


            //update user details on login change status
            $rootScope.$watch("login.details", function () {
                //INITIALIZATION: SET "PS" LAYER BASIC AUTHORIZATION TO EMPTY VALUE
                if (!$rootScope.login.logged) {
                    $location.search('fromExt', null);
                }

                if (($rootScope.login.details !== null) && $rootScope.login.details.info) {

                    //Setting user deals
                    setUserDeals($rootScope.login.details.info);
                    $scope.$broadcast("setSwitchPanelUserDeals", { "userDeals": userDeals });

                    //Setting advanced default displacement filters
                    setDefaultDisplacementFilters();

                    //Setting overlay and metadata ps rheticus displacement layer
                    if (($rootScope.login.details.info !== null) &&
                        $rootScope.login.details.info.layer && ($rootScope.login.details.info.layer !== "")
                    ) {
                        //PS layer management
                        var newLayerId = $rootScope.login.details.info.layer; //rheticus PS layer
                        //var globalLayerId = "rheticus_displacement_global:" + $rootScope.login.details.info.organization_entity.geoserver_username + "_ps";
                        var currentWorkspace = getOverlayParams("ps").source.urls[0].replace(document.location.protocol + "//" + document.location.host + "/geoserver/", "").replace("/wms", "");
                        var newWorkspace = newLayerId.split(":")[0];
                        var newPsURL = getOverlayParams("ps").source.urls[0].replace("/" + currentWorkspace + "/", "/" + newWorkspace + "/");
                        currentWorkspace = newWorkspace;
                        //update urls
                        getOverlayParams("ps").source.urls[0] = newPsURL;
                        getOverlayMetadata("ps").queryUrl = newPsURL;
                        //update layer name
                        getOverlayParams("ps").source.params.LAYERS = newLayerId;
                        if ($rootScope.period == "g") {
                            getOverlayParams("ps").source.params.STYLES = "rheticus_displacement_global:velocity";
                        } else if ($rootScope.period == "ly") {
                            getOverlayParams("ps").source.params.STYLES = "rheticus_displacement_global:velocity_ly";
                        }
                        getOverlayMetadata("ps").custom.LAYERS[0].id = newLayerId;
                        getOverlayParams("ps").source.tileLoadFunction = self.basicAuthTileLoadFunction;

                        //service layer management
                        var serviceLayerId = $rootScope.login.details.info.service_layer;
                        if (serviceLayerId && ($rootScope.login.details.info.layer !== "")) {
                            var serviceWorkspace = serviceLayerId.split(":")[0];
                            //update urls
                            var newPsURL = getOverlayParams("ps").source.urls[0].replace(currentWorkspace+ "/", "");
                            getOverlayParams("service_layer").source.urls[0] = newPsURL;
                            //update layer name
                            getOverlayParams("service_layer").source.params.LAYERS = serviceLayerId;
                            getOverlayParams("service_layer").source.tileLoadFunction = self.basicAuthTileLoadFunction;
                            // enable visualization
                            getOverlayParams("service_layer").visible = true;
                        } else {
                            // disable visualization
                            getOverlayParams("service_layer").visible = false;
                        }

                    }
                }
            });

            /**
             * PRIVATE  VARIABLES AND METHODS
             */
            var MAX_FEATURES = 5;
            var MAX_SENTINEL_MEASURES = 1000;
            //External Controller flag
            var activeController = "";
            var getFeatureInfoPoint = [];
            //Retrieves Overlay ols params or metadata detail
            var getOverlay = function (detail, id) {
                var index = ArrayService.getIndexByAttributeValue(self.overlays, "id", id); // jshint ignore:line
                return eval("self." + detail + "[index]"); // jshint ignore:line
            };
            //Marker
            var setMarker = function (response) { // Marker and PS trends management
                self.marker = {
                    "lat": response.point[1],
                    "lon": response.point[0],
                    "label": {
                        "message": "",
                        "show": false,
                        "showOnMouseOver": true
                    }
                };
            };
            var initMarker = function () {
                setMarker({
                    "point": [99999, 99999]
                });
            };
            //variables for set priority
            var iffiWithResult = true;
            var sentinelWithResult = true;
            var psCandidateWithResult = true;
            //GetFeatureInfo
            var getFeatureInfo = function (map, coordinate, olLayer, olParams, resultObj, callback) {
                getFeatureInfoPoint = ol.proj.toLonLat(coordinate, configuration.map.view.projection); // jshint ignore:line
                var viewResolution = map.getView().getResolution();
                var wms = eval("new ol.source." + olLayer.source.type + "(olLayer.source);"); // jshint ignore:line
                var url = wms.getGetFeatureInfoUrl(coordinate, viewResolution, configuration.map.view.projection, olParams);
                console.log("main-controller.js | getFeatureInfo: url = " + url);
                if (url) {
                    var that = $scope; // jshint ignore:line
                    $http.get(url)
                        //.success(function (response) {
                        .success(function (response, status, headers, config) {
                            //REMOVE ALL INTERROGATION WINDOWS
                            $scope.$broadcast("setFeatureInfoClosure");
                            $scope.$broadcast("setPsTrendsClosure");
                            $scope.$broadcast("setTimelineClosure");
                            $rootScope.closeTimeline = true;
                            var params = null;

                            var contentType = headers('Content-Type');
                            if (contentType.indexOf("/xml") !== -1) {
                                var xmlDoc = $.parseXML(response);
                                var xml = $(xmlDoc);
                                var dateString = xml.find("ServiceExceptionReport")
                                Flash.create('danger', "Layer \"" + olLayer.name + "\" returned an error!!");
                                return;
                            }

                            if (response.features && response.features.length === 0) { //HTTP STATUS == 200 -- no features returned or "ServiceException"
                                //console.log("main-controller.js | getFeatureInfo: no features");
                                //Flash.create('warning', "Layer \""+olLayer.name+"\" returned no features!");
                                //CALL OTHER ACTIVE LAYER IF PS RETURNS NO FEATURE
                                //console.log("main-controller.js | getFeatureInfo: olLayer= " + JSON.stringify(olLayer));
                                //console.log("main-controller.js | getFeatureInfo: self.overlays= " + JSON.stringify(self.overlays));

                                if (olLayer.id.indexOf('iffi') > -1) {
                                    iffiWithResult = false;
                                    //console.log("main-controller.js | getFeatureInfo: no IFFI layer into olLayer");
                                }
                                if (olLayer.id.indexOf('sentinel') > -1) {
                                    sentinelWithResult = false;
                                }
                                if (olLayer.id.indexOf('psCandidate') > -1) {
                                    psCandidateWithResult = false;
                                }

                                if (self.overlays[6].visible && psCandidateWithResult) {
                                    params = {
                                        "INFO_FORMAT": "application/json",
                                        "FEATURE_COUNT": MAX_FEATURES,
                                        "CQL_FILTER": getOverlayParams("psCandidate").source.params.CQL_FILTER
                                    };
                                    getFeatureInfo(map, coordinate, getGetFeatureInfoOlLayer(self.overlays[6]), params, "psCandidate", setMarker);
                                } else if (self.overlays[3].visible && iffiWithResult) {
                                    //console.log("main-controller.js | getFeatureInfo: query IFFI layer to retrieve feature info");
                                    params = {
                                        "INFO_FORMAT": "application/geo+json",
                                        "FEATURE_COUNT": MAX_FEATURES
                                    };
                                    //console.log("main-controller.js | getFeatureInfo | getGetFeatureInfoOlLayer(self.overlays[3]) = " + JSON.stringify(getGetFeatureInfoOlLayer(self.overlays[3])));
                                    getFeatureInfo(map, coordinate, getGetFeatureInfoOlLayer(self.overlays[3]), params, "iffi", setMarker);
                                } else if (self.overlays[4].visible && sentinelWithResult) {
                                    params = {
                                        "INFO_FORMAT": "application/json",
                                        "FEATURE_COUNT": MAX_SENTINEL_MEASURES
                                        //"TIME" : startDate+"/"+endDate
                                    };
                                    getFeatureInfo(map, coordinate, getGetFeatureInfoOlLayer(self.overlays[4]), params, "sentinel", setMarker);
                                } else {
                                    $translate('noResult').then(function (translatedValue) {
                                        $rootScope.markerVisibility = false;
                                        Flash.create('warning', translatedValue);
                                    });
                                }
                            } else {
                                //console.log("main-controller.js | getFeatureInfo: num features " + response.features.length);

                                Flash.dismiss();
                                var obj = {
                                    "point": ol.proj.toLonLat(coordinate, configuration.map.view.projection), // jshint ignore:line
                                    "features": (response.features.length > 0) ? response.features : null
                                };
                                if (resultObj !== "") {
                                    eval("that." + resultObj + " = obj;"); // jshint ignore:line
                                }
                                if ((callback !== undefined) && (typeof callback === "function")) {
                                    callback(obj);
                                }
                            }
                        })
                        .error(function (response) {// jshint ignore:line
                            //HTTP STATUS != 200
                            Flash.create('danger', "Layer \"" + olLayer.name + "\" returned an error!!");
                        });
                } else {
                    ("[main-controller :: getFeatureInfo] URL undefined!");
                }
            };
            var advancedCqlFilters = null;
            var resetAdvancedCqlFilters = function () {
                advancedCqlFilters = {
                    "velocity": "",
                    "coherence": "",
                    "coherence_norm": "",
                    "dataProvider": "",
                    "acceleration": "",
                    "pass": ""
                };
            };
            resetAdvancedCqlFilters();

            var getCqlTextRange = function (minText, maxText) {
                var cqlText = "";
                if ((minText !== "") || (maxText !== "")) {
                    cqlText += "(";
                    cqlText += (minText !== "") ? minText : "";
                    cqlText += ((minText !== "") && (maxText !== "")) ? " AND " : "";
                    cqlText += (maxText !== "") ? maxText : "";
                    cqlText += ")";
                }
                return cqlText;
            };

            //Creates OLS Layer Source from layer properties
            var getGetFeatureInfoOlLayer = function (l) {
                var queryUrl = getOverlayMetadata(l.id).queryUrl;
                var olLayer = null;
                if (queryUrl === "") {
                    olLayer = l;
                } else {
                    var queryType = getOverlayMetadata(l.id).type;
                    switch (queryType) {
                        case "ImageWMS":
                            var idLayers = "";
                            for (var i = 0; i < getOverlayMetadata(l.id).custom.LAYERS.length; i++) {
                                if (getOverlayMetadata(l.id).custom.LAYERS[i].queryable) {
                                    idLayers += getOverlayMetadata(l.id).custom.LAYERS[i].id + ",";
                                }
                            }
                            if (idLayers !== "") {
                                idLayers = idLayers.substring(0, idLayers.length - 1);
                            }
                            olLayer = {
                                "id": l.id,
                                "name": l.name,
                                "source": {
                                    "type": queryType,
                                    "url": queryUrl,
                                    "params": {
                                        "LAYERS": idLayers
                                    }
                                }
                            };
                            break;
                        case "RheticusApiRest":
                            //do nothing
                            break;
                        default:
                        //do nothing
                    }
                }
                return (olLayer);
            };
            //OLS Map interationw
            $scope.mapsIds.forEach(function(mapId){
                olData.getMap(mapId).then(function (map) {
                    //singleclick event
                    map.on("singleclick", function (evt) {
                        iffiWithResult = true;
                        sentinelWithResult = true;
                        psCandidateWithResult = true;
                        var point = ol.proj.toLonLat(evt.coordinate, configuration.map.view.projection); // jshint ignore:line

                        self.overlays.map(function (l) {
                            if (l./*active*/visible) {
                                Flash.dismiss();
                                $translate('loadingResult').then(function (translatedValue) {
                                    Flash.create("info", translatedValue); //for \""+getOverlayMetadata(l.id).legend.title+"\"
                                });
                                var params = null;
                                switch (l.id) {
                                    case "ps":
                                        if (showDetails()) { //proceed with getFeatureInfo request
                                            //console.log("main-controller.js | map.on(singleclick): zoom level -> identify enable ");

                                            params = {
                                                "INFO_FORMAT": "application/json",
                                                "FEATURE_COUNT": MAX_FEATURES,
                                                "CQL_FILTER": getOverlayParams("ps").source.params.CQL_FILTER
                                            };
                                            getFeatureInfo(map, evt.coordinate, getGetFeatureInfoOlLayer(l), params, "ps", setMarker);
                                        } else {
                                            //console.log("main-controller.js | map.on(singleclick): zoom level -> identify not enable ");

                                            //CHECK IF THE OTHER LAYERS ARE ACTIVATED AND CALL THEM.
                                            if (getOverlayParams("psCandidate").visible && psCandidateWithResult) {
                                                params = {
                                                    "INFO_FORMAT": "application/json",
                                                    "FEATURE_COUNT": MAX_FEATURES,
                                                    "CQL_FILTER": getOverlayParams("psCandidate").source.params.CQL_FILTER
                                                };
                                                getFeatureInfo(map, evt.coordinate, getGetFeatureInfoOlLayer(getOverlayParams("psCandidate")), params, "psCandidate", setMarker);
                                            } else if (getOverlayParams("iffi").visible && iffiWithResult) {
                                                //console.log("main-controller.js | map.on(singleclick): query IFFI layer to retrieve feature info");
                                                params = {
                                                    "INFO_FORMAT": "application/geo+json",
                                                    "FEATURE_COUNT": MAX_FEATURES
                                                };
                                                getFeatureInfo(map, evt.coordinate, getGetFeatureInfoOlLayer(getOverlayParams("iffi")), params, "iffi", setMarker);
                                            } else if (getOverlayParams("sentinel").visible && sentinelWithResult) {
                                                params = {
                                                    "INFO_FORMAT": "application/json",
                                                    "FEATURE_COUNT": MAX_SENTINEL_MEASURES
                                                    //"TIME" : startDate+"/"+endDate
                                                };
                                                getFeatureInfo(map, evt.coordinate, getGetFeatureInfoOlLayer(getOverlayParams("sentinel")), params, "sentinel", setMarker);
                                            } else {
                                                $translate('errorZoom').then(function (translatedValue) {
                                                    Flash.create('warning', translatedValue);
                                                });
                                            }
                                        }
                                        break;

                                    default:
                                    //do nothing
                                }
                                $rootScope.markerVisibility = true;
                            }
                        });
                    });

                    map.on("moveend", function (evt) { // jshint ignore:line
                        //pan or zoom event
                        $scope.$broadcast("setFeatureInfoClosure");
                        $scope.$broadcast("setPsTrendsClosure");
                        $scope.$broadcast("setTimelineClosure");
                        $rootScope.markerVisibility = false;
                        if ($scope.$parent.showHelp) {
                            $scope.$parent.showHelp = false;
                        }
                        var lonlat = ol.proj.transform(evt.map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326');
                        var zoom = evt.map.getView().getZoom();
                        self.preventReload = true;
                        $location.search('lat', null);
                        $location.search('lon', null);
                        $location.search('zoom', null);
                        //$location.path("#/?lat=" + lonlat[1] + "&lon=" + lonlat[0] + "&zoom=" + zoom + $scope.userId);
                        // $location.search('lat', lonlat[1]);
                        // $location.search('lon', lonlat[0]);
                        // $location.search('zoom', zoom);
                        //window.history.replaceState({ id: 22 }, "Page 3", "#/?lat=" + lonlat[1] + "&lon=" + lonlat[0] + "&zoom=" + zoom);
                    });
                });
            });

            $rootScope.$on('unauthorized', function () {
                if ($rootScope.login.logged === true) {
                    $translate('sessionExpired').then(function (translatedValue) {
                        $window.alert(translatedValue);
                    });
                }
                AuthenticationService.ClearCredentials();

                document.getElementById('userNameView').innerHTML = "";

            });


            //User deals management
            var setUserDeals = function (info) {
                userDeals = [];
                if ((info !== null) && info.organization_entity.deals && (info.organization_entity.deals.length > 0)) {
                    angular.forEach(info.organization_entity.deals,
                        function (item) {
                            var coords = (item.geom_geo_json && item.geom_geo_json !== "") ? JSON.parse(item.geom_geo_json) : null;
                            if (item.service_type.indexOf("displacement") > -1) {
                                userDeals.push({
                                    "signature_date": (item.signature_date && item.signature_date !== "") ? item.signature_date : "",
                                    "product_id": (item.product_id && item.product_id !== "") ? item.product_id : -1,
                                    "product_name": (item.product_name && item.product_name !== "") ? item.product_name : "",
                                    "geom_geo_json": coords, //geojson Object
                                    "sensorid": (item.sensorid && item.sensorid !== "") ? item.sensorid : "",
                                    "start_period": (item.start_period && item.start_period !== "") ? item.start_period : "",
                                    "end_period": (item.end_period && item.end_period !== "") ? item.end_period : ""
                                });
                            }
                        }
                    );
                    for (var i = 0; i < userDeals.length - 1; i++) {
                        for (var j = i + 1; j < userDeals.length; j++) {
                            if (userDeals[i].product_name > userDeals[j].product_name) {
                                var tempDeal = userDeals[i];
                                userDeals[i] = userDeals[j];
                                userDeals[j] = tempDeal;
                            }
                        }
                    }
                }
            };

            $rootScope.$watch("map2Visibility", function () {
                self.map2Visibility = $rootScope.map2Visibility;
            });

            $rootScope.$watch("mapMode", function () {
                self.mapMode = $rootScope.mapMode;
            });

            $rootScope.$watch("screenSize", function () {
                self.screenSize = $rootScope.screenSize;

                if(self.screenSize != null){
                    self.multipleMapSize.width.int = self.screenSize.width.int/2;
                    self.multipleMapSize.width.px =  self.multipleMapSize.width.int + 'px';

                    self.multipleMapSize.height = self.screenSize.height;
                }
            });

            $rootScope.$watch("swiperSize", function () {
                self.swiperSize = $rootScope.swiperSize;
            });
        }]);
