'use strict';

/**
 * @ngdoc function
 * @name rheticus.controller:CesiumViewerCtrl
 * @description
 * # CesiumViewerCtrl
 * CesiumViewer Controller for rheticus project
 */
angular.module('rheticus')
    .controller('CesiumViewerCtrl',['$scope','configuration','olData',
    function ($scope,configuration,olData){

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
        "active2D": "true",
  			"openViewer" : function(){
          olData.getMap('map-default').then(function (map) {
            var extent = ol.proj.transformExtent( // jshint ignore:line
              map.getView().calculateExtent(map.getSize()), configuration.map.view.projection, "EPSG:4326"
            );
            //var extent = map.getView().calculateExtent(map.getSize());
            window.open(
              configuration.cesiumViewer.url+
              "?west="+extent[0]+
              "&south="+extent[1]+
              "&east="+extent[2]+
              "&north="+extent[3]+
              "&mapId="+configuration.cesiumViewer.mapId+
              "&layerId="+$scope.getOverlayParams("ps").source.params.LAYERS+
              "&extent="+getMapViewExtent()+
              "&BASIC_AUTH="+$scope.getOverlayParams("ps").source.params.BASIC_AUTH
            );
          });
  			}
  		});
    }]);
