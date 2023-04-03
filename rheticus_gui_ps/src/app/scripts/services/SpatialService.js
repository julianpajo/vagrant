'use strict';

/**
 * @ngdoc function
 * @name rheticus.service:SpatialService
 * @description
 * # SpatialService
 * Spatial Service for rheticus project
 */
angular.module('rheticus')
  .service('SpatialService', function() {
    /**
		 * Parameters:
		 * coords - Array<{Object}>
		 *
		 * Returns:
		 * {Object} - Bounding Box Coordinates
		 */
		this.boundingBoxAroundPolyCoords = function(coords) {
			var res = null;
			try {
				if ((coords!==null) && (coords.length>0)){
					var xAll = [], yAll = [];
					for (var i=0; i<coords[0].length; i++) {
						xAll.push(coords[0][i][0]);
						yAll.push(coords[0][i][1]);
					}
					xAll = xAll.sort(function (a,b) {
						return a - b;
					});
					yAll = yAll.sort(function (a,b) {
						return a - b;
					});
					res = {
						"left" : xAll[0],
						"bottom" : yAll[0],
						"right" : xAll[xAll.length-1],
						"top" : yAll[yAll.length-1]
					};
				}
			} catch (e) {
				console.log("[SpatialService :: boundingBoxAroundPolyCoords] EXCEPTION : '"+e);
			} finally {
				return(res);
			}
		};
    /**
		 * Parameters:
		 * current - {Object}
		 * feature - {Object}
		 *
		 * Returns:
		 * {Object} - Bounding Box Coordinates
		 */
		this.updateCropBoundingBox = function(current,feature) {
			if ((current!==null) && (feature!==null)){
				return {
					"left" : (feature.left<current.left) ? feature.left : current.left,
					"bottom" : (feature.bottom<current.bottom) ? feature.bottom : current.bottom,
					"right" : (feature.right>current.right) ? feature.right : current.right,
					"top" : (feature.top>current.top) ? feature.top : current.top
				};
			}
		};
    /**
		 * Create INTERSECT spatial filters
		 * i.e.: INTERSECTS("geom",POLYGON ((11.12 46.035, 11.13 46.035, 11.13 46.036, 11.12 46.036, 11.12 46.035)))
		 */
		this.getIntersectSpatialFilterCqlText = function(type,coords){
			var cqlText = "";
			if ((type!=="") && (coords!==null) && (coords.length>0)){
				cqlText += "INTERSECTS(\"geom\","+type.toUpperCase()+" ((";
				for (var i=0; i<coords[0].length; i++) {
					cqlText += coords[0][i][0] + " " + coords[0][i][1];
					if (i<(coords[0].length-1)){
						cqlText += ", ";
					}
				}
				cqlText += ")))";
			}
			return cqlText;
		};
    /**
		 * Parameters:
		 * coords - Array<{Object}>
		 *
		 * Returns:
		 * {Object} - Center within Bounding Box Coordinates
		 */
     /*
    //NOT USED WITHIN THIS PROJECT
    this.getCenterWithinPolyCoords = function(coords) {
      var bbox = this.boundingBoxAroundPolyCoords(coords);
      return {
        "lon" : (((bbox.left+bbox.right)/2)*1000)/1000, //rounded to third decimal
        "lat" : (((bbox.bottom+bbox.top)/2)*1000)/1000 //rounded to third decimal
      };
    };
    */
    /**
		 * Parameters:
		 * bbox - {Object} with the following keys: minx,miny,maxx,maxy
		 *
		 * Returns:
		 * {Object} - GeoJSON rectangle polygon object
		 */
     /*
     //NOT USED WITHIN THIS PROJECT
		this.getGeoJSONBoundingBox = function(bbox){
			var geoJSON = null;
			if ((bbox!=null) &&
          (bbox.minx && !isNaN(bbox.minx)) &&
          (bbox.miny && !isNaN(bbox.miny)) &&
          (bbox.maxx && !isNaN(bbox.maxx)) &&
          (bbox.maxy && !isNaN(bbox.maxy))
        ){

          var setCoord = function(x,y){
            var coord = [];
            coord.push(x);
            coord.push(y);
            return coord;
          };

          var rect = [];
          rect.push(setCoord(bbox.minx,bbox.miny));
          rect.push(setCoord(bbox.maxx,bbox.miny));
          rect.push(setCoord(bbox.maxx,bbox.maxy));
          rect.push(setCoord(bbox.minx,bbox.maxy));
          rect.push(setCoord(bbox.minx,bbox.miny));

          geoJSON = [];
          geoJSON.push(rect);
			}
			return geoJSON;
		};
    */
  });
