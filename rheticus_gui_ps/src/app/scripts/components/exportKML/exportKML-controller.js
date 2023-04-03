'use strict';

/**
 * @ngdoc function
 * @name rheticus.controller:exportKMLCtrl
 * @description
 * # exportKMLCtrl
 * exportKML Controller for rheticus project
 */
angular.module('rheticus')
    .controller('exportKMLCtrl',['$rootScope','$scope','$http','configuration','olData','$translate','Flash','FileSaver',
    function ($rootScope,$scope,$http,configuration,olData,$translate,Flash,FileSaver){

      var self = this; //this controller

      // Get 4326 map extent from GeoJSON bounds
      var getMapViewExtent = function(){
        var minx = 180,
            maxx = -180,
            miny = 90,
            maxy = -90;

        angular.forEach($scope.getUserDeals(), function(item) {
						if (
              item.geom_geo_json && (item.geom_geo_json!==null) &&
              item.geom_geo_json.type && (item.geom_geo_json.type!=="") &&
              item.geom_geo_json.coordinates && (item.geom_geo_json.coordinates!==null) && (item.geom_geo_json.coordinates.length>0)
            ){
              var geom = eval("new ol.geom."+item.geom_geo_json.type+"(item.geom_geo_json.coordinates);"); // jshint ignore:line
              var ex = geom.getExtent();
              minx = (minx>ex[0]) ? ex[0] : minx;
              miny = (miny>ex[1]) ? ex[1] : miny;
              maxx = (maxx<ex[2]) ? ex[2] : maxx;
              maxy = (maxy<ex[3]) ? ex[3] : maxy;
            }
					}
        );
        if((minx!==180) && (maxx!==-180) && (miny!==90) && (maxy!==-90)) {
          return minx+","+miny+","+maxx+","+maxy;
        }
        return "";
      };

  		angular.extend(this,{
  			"download" : function(){
          self.showLoading=true;
          olData.getMap('map-default').then(function (map) {
            var extent = ol.proj.transformExtent( // jshint ignore:line
              map.getView().calculateExtent(map.getSize()), configuration.map.view.projection, "EPSG:4326"
            );
            $translate('generateKml').then(function (translatedValue) {
                Flash.create('warning', translatedValue);
            });
            //var extent = map.getView().calculateExtent(map.getSize());
            var url = $rootScope.configurationCurrentHost.rheticusAPI.exportKML.url+
                "bbox="+ extent[0]+","+extent[1]+","+extent[2]+","+extent[3]+"&"+
                "username=" + $rootScope.login.details.info.username+"&"+
                "organization_alias=" + $rootScope.login.details.info.organization_entity.alias+"&"+                
                "velocity="+$scope.speedModel.init+"&"+
                "coherence="+(!$rootScope.normalizeCoherenceFlag?$scope.coherenceModel.init:"")+"&"+
                "coherence_norm="+($rootScope.normalizeCoherenceFlag?$scope.coherenceNormModel.init:"")+"&"+
                "acceleration="+$scope.accelerationModel.init+"&"+                
                "period="+ $rootScope.period;

            $http.get(url)
      				.success(function (data) {
                self.showLoading=false;
                var documentName="Export_"+d3.time.format("%d/%m/%Y")(new Date())+".kml";
                var blob = new Blob([data], {
                    type: "application/xml;charset=utf-8;",
                });
                saveAs(blob, documentName);
      				})
              .error(function (response) {
    						//HTTP STATUS != 200
    						Flash.create('danger', "KML Export Service has returned an error!");
                self.showLoading=false;
    					});
          });
  			}
  		});
      angular.extend(self,{
        "visibleWarning":false,
        "showLoading":false
      });
      //show/hide warning text on zoom change
      $scope.$watch("center.zoom", function (zoom) {
        if (zoom >= 17) {
          self.visibleWarning = true; //SET THIS TO TRUE WHEN GAP FIX HEIGHT
        } else {
          self.visibleWarning = false;
        }
      });
    }]);
