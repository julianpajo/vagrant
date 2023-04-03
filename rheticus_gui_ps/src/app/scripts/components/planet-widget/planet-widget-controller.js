'use strict';

/**
 * @ngdoc function
 * @name rheticus.controller:MainCtrl
 * @description
 * # MainCtrl
 * Main Controller for rheticus project
 */
angular.module('rheticus')
    .controller('PlanetWidgetCtrl', ['$rootScope', '$scope', 'configuration', '$translate', '$http', 'olData', 'Flash', 'SessionService',
        function ($rootScope, $scope, configuration, $translate, $http, olData, Flash, SessionService) {
            var self = this; //this controller

            var activateWidget = false;
            var expandedBar = false;
            var collapsedBarStyle = {width: "90px"};

            window.onresize = function(){
                updateSwiperSize();
            };


            var updateMaps = function(){
                self.maps.default.updateSize();
                self.maps.multiple_left.updateSize();
                self.maps.multiple_right.updateSize();
                self.maps.swiper_left.updateSize();
                self.maps.swiper_right.updateSize();
            };

            var date = {
              "left": null,
              "right": null
            };

            var isFirstDatePickerOpen = false;
            var isSecondDatePickerOpen = false;

            var checkboxMap1 = true;
            var checkboxMap2 = true;

            var showTimeController = {
                "left": false,
                "right": false
            };

            var timeLabel = {
                "left": {
                    "dateLabel": "No date selected",
                    "visibility": false
                },
                "right": {
                    "dateLabel": "No date selected",
                    "visibility": false
                }
            };

            var httpResults = {
                "left": {
                    "urlArrayMap": [],
                    "urlArrayMapIndex": 0,
                    "acquiredArrayMap": []
                },
                "right": {
                    "urlArrayMap": [],
                    "urlArrayMapIndex": 0,
                    "acquiredArrayMap": []
                }
            };

            var addDateButtonVisibility = true;

            var map2Visibility = false;

            var switchMapButtonVisibility = false;

            var mapMode = {
                "default": true,
                "multiple": false,
                "swiper": false
            };

            var METHOD = 'POST';
            var URL = 'https://api.planet.com/data/v1/quick-search';
            var HEADERS = {
                'Authorization': 'Basic M2ZlYjdhZTcyZWE2NDAwZjg5OGIyNTI5MTAzOTE4MDk6',
                'Content-Type': 'application/json'
            };
            var body = {
                "filter": {
                    "type": "AndFilter",
                    "config": [
                        {
                            "type": "DateRangeFilter",
                            "field_name": "acquired",
                            "config": {
                                "gte": "2020-07-18T00:00:00Z",
                                "lte": "2020-07-18T23:59:59Z"
                            }
                        },
                        {
                            "type": "GeometryFilter",
                            "field_name": "geometry",
                            "config": {
                                "type": "Polygon",
                                "coordinates": [
                                    []
                                ]
                            }
                        }
                    ]
                },
                "item_types": [
                    "PSScene3Band"
                ],
                "name": "test"
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

            var swiperWidth = {
                "int": null,
                "px": null
            };

            var swiperHeight = {
                "int": null,
                "px": null
            };

            var maps = {
                "default": null,
                "multiple_left": null,
                "multiple_right": null,
                "swiper_left": null,
                "swiper_right": null
            };

            var initializeMapsReferences = function() {
                olData.getMap('map-default').then(function (map) {
                    self.maps.default = map;
                });

                olData.getMap('map-multiple-left').then(function (map) {
                    self.maps.multiple_left = map;
                });

                olData.getMap('map-multiple-right').then(function (map) {
                    self.maps.multiple_right = map;
                });

                olData.getMap('map-swiper-left').then(function (map) {
                    self.maps.swiper_left = map;
                });

                olData.getMap('map-swiper-right').then(function (map) {
                    self.maps.swiper_right = map;
                });
            };

            initializeMapsReferences();

            var changeMapMode = function(mode){
                switch (mode) {
                    case "default":
                        self.mapMode.default = true;
                        self.mapMode.multiple = false;
                        self.mapMode.swiper = false;
                        self.timeLabel.right.visibility = false;
                        break;
                    case "multiple":
                        self.mapMode.default = false;
                        self.mapMode.multiple = true;
                        self.mapMode.swiper = false;
                        self.timeLabel.right.visibility = true;
                        break;
                    case "swiper":
                        self.mapMode.default = false;
                        self.mapMode.multiple = false;
                        self.mapMode.swiper = true;
                        self.timeLabel.right.visibility = true;
                        break;
                }
                // trigger change detection in the main-controller.js
                $rootScope.mapMode = self.mapMode;
                $rootScope.timeLabel = self.timeLabel;

                setTimeout(self.updateMaps, 1);
            };

            var buttonSwitchMapMode = function(){
                if(self.mapMode.default){
                    self.changeMapMode("multiple");
                }else{
                    if(self.mapMode.multiple){
                        self.changeMapMode("swiper");
                        updateSwiperSize();

                    }else{
                        if(self.mapMode.swiper){
                            self.changeMapMode("multiple");
                        }
                    }
                }
            };

            var monthMap = {};
            for (var i = 0; i < 12; i++) {
                var num = i + 1;
                if (i < 9) {
                    monthMap[i] = "0" + num.toString();
                } else {
                    monthMap[i] = num.toString();
                }
            }

            var dayMap = {};
            for (i = 1; i < 32; i++) {
                if (i < 10) {
                    dayMap[i] = "0" + i.toString();
                } else {
                    dayMap[i] = i.toString();
                }
            }

            var removeFirstLayer = function () {
                // if the user remove the second datepicker, just hide it and show add date button
                // else, if the user remove the first datepicker and the secondo is on, copy everything in the first
                // datepicker and hide the second one

                self.changeMapMode('default');
                $rootScope.switchMapButtonVisibility = false;

                if(self.date.right === null){
                    $scope.getOverlays()[0].visible = false;
                    self.date.left = null;
                    self.checkboxMap1 = true;
                }
                else{

                    // if second date is not null transfer all data of second map to first one

                    self.date.left = self.date.right;
                    showTimeController.left = showTimeController.right;
                    self.checkboxMap1 = self.checkboxMap2;
                    self.checkboxMap2 = true;

                    httpResults.left = httpResults.right;

                    document.getElementById("datepicker1-data").style.color = document.getElementById("datepicker2-data").style.color;
                    if(httpResults.left.acquiredArrayMap.length > 0){
                        self.timeLabel.left.dateLabel = self.getFormattedDateForDatePicker(self.date.left) + " - " + self.getAcquisitionTime(httpResults.left.acquiredArrayMap[httpResults.left.urlArrayMapIndex]);
                        $rootScope.timeLabel = self.timeLabel;
                    }

                    $rootScope.map2Visibility = false;
                    self.date.right = null;

                    $scope.getOverlays()[0].visible =  $scope.getOverlays()[1].visible;
                    $scope.getOverlays()[1].visible = false;
                    $scope.getOverlays()[0].source.url = httpResults.left.urlArrayMap[httpResults.left.urlArrayMapIndex];

                }
            };

            var removeSecondLayer = function () {
                $scope.getOverlays()[1].visible = false;
                self.date.right = null;

                self.checkboxMap2 = true;

                self.changeMapMode("default");
                $rootScope.map2Visibility = false;
                $rootScope.switchMapButtonVisibility = false;
            };

            var toogleWidget = function () {
                self.activateWidget = !self.activateWidget;
                self.expandedBar = self.activateWidget;
                removeSecondLayer();
                removeFirstLayer();
                updateScreenSize();
                updateSwiperSize();
                self.timeLabel.left.visibility = !self.timeLabel.left.visibility;
                self.timeLabel.right.visibility = false;
                $rootScope.timeLabel = self.timeLabel;
                self.changeMapMode("default");
            };

            var clickFirstDate = function () {
                self.date.left = new Date();
                setTimeout(function () {
                    self.isFirstDatePickerOpen = true;
                    $rootScope.$digest();
                }, 1);
            };

            var clickSecondDate = function () {
                self.date.right = new Date();
                setTimeout(function () {
                    self.isSecondDatePickerOpen = true;
                    $rootScope.map2Visibility = true;
                    $rootScope.switchMapButtonVisibility = true;

                    if(self.mapMode.default){
                        self.changeMapMode("multiple");
                    }

                    $rootScope.switchMapButtonVisibility = true;
                    $rootScope.$digest();
                }, 1);
            };

            var addDateButton = function(){
                if(self.date.left === null){
                    self.clickFirstDate();
                }
                else{
                    self.clickSecondDate();
                }
            };

            var updateScreenSize = function(){
                screenSize.height.int = document.documentElement.clientHeight;
                screenSize.height.px = screenSize.height.int + "px";

                screenSize.width.int = document.documentElement.clientWidth;
                screenSize.width.px = screenSize.width.int + "px";

                // trigger change detection in main-view.js
                $rootScope.screenSize = screenSize;
            };

            var updateSwiperSize = function(){
                swiperSize.width.int = $rootScope.screenSize.width.int/2;
                swiperSize.width.px = swiperSize.width.int + "px";

                swiperSize.height.int = $rootScope.screenSize.height.int - 50;
                swiperSize.height.px = swiperSize.height.int + "px";

                // trigger change detection in main-view.js
                $rootScope.swiperSize = swiperSize;
            };


            var buildUrlForXYZRequest = function (baseUrl, itemId, itemType) {
                var newUrl = baseUrl;
                newUrl = newUrl.replace("<item_type>", itemType);
                newUrl = newUrl.replace("<item_id>", itemId);
                return newUrl;
            };

            var plusTimeButtonController1 = function () {
                httpResults.left.urlArrayMapIndex++;
                if (httpResults.left.urlArrayMapIndex >= httpResults.left.urlArrayMap.length) {
                    httpResults.left.urlArrayMapIndex = 0;
                }
                // on-off the planet layer
                $scope.getOverlays()[0].visible = false;
                $scope.getOverlays()[0].visible = true;

                self.timeLabel.left.dateLabel = self.getFormattedDateForDatePicker(self.date.left) + " - " + self.getAcquisitionTime(httpResults.left.acquiredArrayMap[httpResults.left.urlArrayMapIndex]);
                $rootScope.timeLabel = self.timeLabel;

                // load tiles from url
                $scope.getOverlays()[0].source.url = httpResults.left.urlArrayMap[httpResults.left.urlArrayMapIndex];
            };

            var minusTimeButtonController1 = function () {
                httpResults.left.urlArrayMapIndex--;
                if (httpResults.left.urlArrayMapIndex < 0) {
                    httpResults.left.urlArrayMapIndex = httpResults.left.urlArrayMap.length - 1;
                }
                // on-off the planet layer
                $scope.getOverlays()[0].visible = false;
                $scope.getOverlays()[0].visible = true;

                self.timeLabel.left.dateLabel = self.getFormattedDateForDatePicker(self.date.left) + " - " + self.getAcquisitionTime(httpResults.left.acquiredArrayMap[httpResults.left.urlArrayMapIndex]);
                $rootScope.timeLabel = self.timeLabel;

                // load tiles from url
                $scope.getOverlays()[0].source.url = httpResults.left.urlArrayMap[httpResults.left.urlArrayMapIndex];
            };

            var plusTimeButtonController2 = function () {
                httpResults.right.urlArrayMapIndex++;
                if (httpResults.right.urlArrayMapIndex >= httpResults.right.urlArrayMap.length) {
                    httpResults.right.urlArrayMapIndex = 0;
                }
                // on-off the planet layer
                $scope.getOverlays()[1].visible = false;
                $scope.getOverlays()[1].visible = true;

                self.timeLabel.right.dateLabel = self.getFormattedDateForDatePicker(self.date.right) + " - " + self.getAcquisitionTime(httpResults.right.acquiredArrayMap[httpResults.right.urlArrayMapIndex]);
                $rootScope.timeLabel = self.timeLabel;

                // load tiles from url
                $scope.getOverlays()[1].source.url = httpResults.right.urlArrayMap[httpResults.right.urlArrayMapIndex];
            };

            var minusTimeButtonController2 = function () {
                httpResults.right.urlArrayMapIndex--;
                if (httpResults.right.urlArrayMapIndex < 0) {
                    httpResults.right.urlArrayMapIndex = httpResults.right.urlArrayMap.length - 1;
                }
                // on-off the planet layer
                $scope.getOverlays()[1].visible = false;
                $scope.getOverlays()[1].visible = true;

                self.timeLabel.right.dateLabel = self.getFormattedDateForDatePicker(self.date.right) + " - " + self.getAcquisitionTime(httpResults.right.acquiredArrayMap[httpResults.right.urlArrayMapIndex]);
                $rootScope.timeLabel = self.timeLabel;


                // load tiles from url
                $scope.getOverlays()[1].source.url = httpResults.right.urlArrayMap[httpResults.right.urlArrayMapIndex];
            };


            var req = {
                method: METHOD,
                url: URL,
                headers: HEADERS,
                data: body
            };

            var sortUrlArrayMapAndAcquiredArrayMap = function(urlArrayMap, acquiredArrayMap){

                //if there's just an element, do not order
                if(urlArrayMap.length === 1){
                    return {
                        "urlArrayMap": urlArrayMap,
                        "acquiredArrayMap": acquiredArrayMap
                    };
                }

                var temp = null;

                var date1 = null;
                var date2 = null;

                for(var i=0; i<acquiredArrayMap.length; i++){
                    for(var j=i+1; j<acquiredArrayMap.length; j++){

                        date1 = new Date(acquiredArrayMap[i]);
                        date2 = new Date(acquiredArrayMap[j]);

                        if(date1.getTime() > date2.getTime()){
                            // swap elements arrayMap
                            temp = urlArrayMap[i];
                            urlArrayMap[i] = urlArrayMap[j];
                            urlArrayMap[j] = temp;

                            // swap elements acquiredArrayMap
                            temp = acquiredArrayMap[i];
                            acquiredArrayMap[i] = acquiredArrayMap[j];
                            acquiredArrayMap[j] = temp;
                        }
                    }
                }

                return {
                    "urlArrayMap": urlArrayMap,
                    "acquiredArrayMap": acquiredArrayMap
                };

            };


            var getMapFromPlanetButton = function (order) {

                var datepickerId = '';
                if(order === 'left'){
                    datepickerId = "datepicker1-data";
                }
                else{
                    datepickerId = "datepicker2-data";
                }

                var mapId = computeMapId(order);

                var gte = date[order].getFullYear().toString() + "-" +
                    monthMap[date[order].getMonth()] + "-" +
                    dayMap[date[order].getDate()] + "T00:00:00Z";

                var lte = date[order].getFullYear().toString() + "-" +
                    monthMap[date[order].getMonth()] + "-" +
                    dayMap[date[order].getDate()] + "T23:59:59Z";

                // set dateRange filter in the query
                self.body.filter.config[0].config.gte = gte;
                self.body.filter.config[0].config.lte = lte;


                olData.getMap(mapId).then(function (map) {
                    map.updateSize();
                    var extent = ol.proj.transformExtent( // jshint ignore:line
                        map.getView().calculateExtent(map.getSize()), configuration.map.view.projection, "EPSG:4326"
                    );

                    // get the zoom level
                    // console.log("zoom level: " + map.getView().getZoom());

                    self.body.filter.config[1].config.coordinates[0][0] = [extent[0], extent[1]];
                    self.body.filter.config[1].config.coordinates[0][1] = [extent[2], extent[1]];
                    self.body.filter.config[1].config.coordinates[0][2] = [extent[0], extent[3]];
                    self.body.filter.config[1].config.coordinates[0][3] = [extent[2], extent[3]];

                    $http(req)
                        .success(function (data) {

                            // check if there's at least one acquisition for the query
                            if(data.features.length === 0){
                                document.getElementById(datepickerId).style.color = "red";
                                self.showTimeController[order] = false;
                            }
                            else{
                                document.getElementById(datepickerId).style.color = "white";
                                console.log("item_id: " + data.features[0].id + "\n");
                                console.log("item_type: " + data.features[0].properties.item_type + "\n");
                                console.log("acquired: " + data.features[0].properties.acquired + "\n");

                                //initialize at each new request
                                httpResults[order].urlArrayMap = [];
                                httpResults[order].urlArrayMapIndex = 0;
                                httpResults[order].acquiredArrayMap = [];

                                // create url array to cycle within different times
                                for (var i = 0; i < data.features.length; i++) {
                                    httpResults[order].urlArrayMap.push(buildUrlForXYZRequest($scope.getOverlays()[0].baseUrl, data.features[i].id, data.features[i].properties.item_type));
                                    httpResults[order].acquiredArrayMap.push(data.features[i].properties.acquired);
                                }

                                var sortedArrays = sortUrlArrayMapAndAcquiredArrayMap(httpResults[order].urlArrayMap, httpResults[order].acquiredArrayMap);

                                httpResults[order].urlArrayMap = sortedArrays.urlArrayMap;
                                httpResults[order].acquiredArrayMap = sortedArrays.acquiredArrayMap;

                                if( httpResults[order].urlArrayMap.length > 1){
                                    self.showTimeController[order] = true;
                                }
                                else{
                                    self.showTimeController[order] = false;
                                }

                                // update timeLabel -> watcher will update self.timeLabel
                                self.timeLabel[order].dateLabel = self.getFormattedDateForDatePicker(date[order]) + " - " + self.getAcquisitionTime(httpResults[order].acquiredArrayMap[0]);
                                $rootScope.timeLabel = self.timeLabel;

                                var planetMapIndex = {
                                    "left": 0,
                                    "right": 1
                                };

                                // on-off the planet layer
                                $scope.getOverlays()[planetMapIndex[order]].visible = false;
                                $scope.getOverlays()[planetMapIndex[order]].visible = true;

                                // load the first tiles from the url array
                                $scope.getOverlays()[planetMapIndex[order]].source.url = httpResults[order].urlArrayMap[0];
                            }
                        })
                        .error(function (error) {
                            console.log(error);
                        });

                });

            };

            var computeMapId = function(order){

                if(self.mapMode.default){
                    return 'map-default';
                }
                if(self.mapMode.multiple && order === 'left'){
                    return 'map-multiple-left';
                }
                if(self.mapMode.multiple && order === 'right'){
                    return 'map-multiple-right';
                }
                if(self.mapMode.swiper && order === 'left'){
                    return 'map-swiper-left';
                }
                if(self.mapMode.swiper && order === 'right'){
                    return 'map-swiper-right';
                }

                return null;
            };
            
            var getMapFromPlanetStub = function(){
                console.log("mappa selezionata, data: "+ self.firstDate);
            };


            var expandBar = function () {
                self.expandedBar = !self.expandedBar;
            };

            var changeVisibilityMap1 = function () {
                self.checkboxMap1 = !self.checkboxMap1;
                $scope.getOverlays()[0].visible = self.checkboxMap1;
            };

            var changeVisibilityMap2 = function () {
                self.checkboxMap2 = !self.checkboxMap2;
                $scope.getOverlays()[1].visible = self.checkboxMap2;
            };

            var getFormattedDateForDatePicker = function (date) {
                if (date !== null) {
                    return dayMap[date.getDate()] + "/" +
                        monthMap[date.getMonth()] + "/" +
                        date.getFullYear().toString();
                }
            };

            var getAcquisitionTime = function (acquisition) {
                var time = "";
                for (var i = 11; i < 19; i++) {
                    time += acquisition[i];
                }
                return time;
            };

            var checkPlanetWidgetVisibility = function() {
                const apiUrl = $rootScope.configurationCurrentHost.rheticusAPI.host + '/service_whitelist/org/'+
                    $rootScope.login.details.info.organization_entity.id;
                $http.get(apiUrl).success(function(response) {
                    if (response.data) {
                        self.isAllowed = false;
                        response.data.forEach(function(whitelist) {
                            if(whitelist.service_entity.name.toLowerCase() === 'planet') {
                                self.isAllowed = true;
                            }
                        });
                    }
                }).error(function (error) {
                    Flash.create("danger", error);
                });
            };

            $rootScope.$watch('login.details', function(v) {
                if(v && SessionService.getData('token')) {
                    checkPlanetWidgetVisibility();
                } else {
                    self.isAllowed = false;
                }
            });

            /**
             * EXPORT AS PUBLIC CONTROLLER
             */
            angular.extend(self, {
                "activateWidget": activateWidget,
                "toogleWidget": toogleWidget,
                "expandedBar": expandedBar,
                "expandBar": expandBar,
                "collapsedBarStyle": collapsedBarStyle,
                "date": date,
                "isFirstDatePickerOpen": isFirstDatePickerOpen,
                "isSecondDatePickerOpen": isSecondDatePickerOpen,
                "clickFirstDate": clickFirstDate,
                "clickSecondDate": clickSecondDate,
                "body": body,
                "getMapFromPlanetButton": getMapFromPlanetButton,
                "buildUrlForXYZRequest": buildUrlForXYZRequest,
                "removeFirstLayer": removeFirstLayer,
                "removeSecondLayer": removeSecondLayer,
                "checkboxMap1": checkboxMap1,
                "checkboxMap2": checkboxMap2,
                "changeVisibilityMap1": changeVisibilityMap1,
                "changeVisibilityMap2": changeVisibilityMap2,
                "getFormattedDateForDatePicker": getFormattedDateForDatePicker,
                "getAcquisitionTime": getAcquisitionTime,
                "plusTimeButtonController1": plusTimeButtonController1,
                "minusTimeButtonController1": minusTimeButtonController1,
                "plusTimeButtonController2": plusTimeButtonController2,
                "minusTimeButtonController2": minusTimeButtonController2,
                "addDateButtonVisibility": addDateButtonVisibility,
                "addDateButton": addDateButton,
                "showTimeController": showTimeController,
                "getMapFromPlanetStub": getMapFromPlanetStub,
                "map2Visibility": map2Visibility,
                "buttonSwitchMapMode": buttonSwitchMapMode,
                "mapMode": mapMode,
                "changeMapMode": changeMapMode,
                "switchMapButtonVisibility": switchMapButtonVisibility,
                "maps": maps,
                "updateMaps": updateMaps,
                "isAllowed": false
            });

            angular.extend($rootScope, {
                "timeLabel": timeLabel,
                "map2Visibility": map2Visibility,
                "mapMode": mapMode,
                "mapMode_default": mapMode.default,
                "mapMode_multiple": mapMode.multiple,
                "mapMode_swiper": mapMode.swiper,
                "screenSize": screenSize,
                "swiperSize": swiperSize,
                "swiperWidth": swiperWidth,
                "swiperHeight": swiperHeight,
                "switchMapButtonVisibility": switchMapButtonVisibility
            });

            /**
             * WATCHERS
             */

            $rootScope.$watch("timeLabel", function () {
                self.timeLabel = $rootScope.timeLabel;
            });


            $rootScope.$watch("map2Visibility", function () {
                self.map2Visibility = $rootScope.map2Visibility;
            });

            $rootScope.$watch("switchMapButtonVisibility", function () {
                self.switchMapButtonVisibility = $rootScope.switchMapButtonVisibility;
            });

            $rootScope.$watch("mapMode", function () {
                self.mapMode = $rootScope.mapMode;
            });

            $rootScope.$watch("mapMode_default", function () {
                self.mapMode.default = $rootScope.mapMode_default;
            });

            $rootScope.$watch("mapMode_swiper", function () {
                self.mapMode.swiper = $rootScope.mapMode_swiper;
            });

            $rootScope.$watch("mapMode_multiple", function () {
                self.mapMode.multiple = $rootScope.mapMode_multiple;
            });

        }]);
