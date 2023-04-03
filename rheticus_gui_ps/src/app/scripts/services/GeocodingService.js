'use strict';

/**
 * @ngdoc function
 * @name rheticus.service:GeocodingService
 * @description
 * # GeocodingService
 * Geocoding Service for rheticus project
 */
angular.module('rheticus')
  .service('GeocodingService',['$http','configuration',function($http,configuration){
      var host = configuration.rheticusAPI.host
          .replace("locationHost", document.location.host)
          .replace("locationProtocol", document.location.protocol);
      var isLocationLoading = false;

      this.getIsLocationLoading = function (){
          return isLocationLoading;
      };

    /**
		 * Parameters:
		 * location - {String}
		 * callback - {Function}
     *
		 * Returns:
		 * Array<{Object}> - Result list
		 */
    this.geocode = function(location, callback){
      if (!((callback!==undefined) && (typeof callback==="function"))){
        return false;
      }
      try {
        if (location.length > 2) {
            var sizeLocation = location.length;
            location = location.replace('/[^a-zA-Z0-9]/g','+');
            var url = configuration.geocoder.url+location+configuration.geocoder.params;
            $http.get(url)
                .success(function (response) {
                  callback(response,sizeLocation);
              })
                .error(function () {
                callback(null);
              });
            return true;
        } else {
            return false;
        }
      } catch (e) {
          console.log("[GeocodingService :: geocode] EXCEPTION : '"+e);
          callback(null);
          return false;
      } finally {
      }
    };

      /**
       * Retrieves location for a scatterer and sets the display_name attribute with result
       * @param coord JSON Object of latitude and longitude coordinates
       * @param element Object to set display_name
       */
      var locateScatterer = function (coord, element){
          var reverseGeoUrl = configuration.geocoder.urlReverse+'lat='+coord.lat+
              '&lon='+coord.lon+configuration.geocoder.paramsReverse;
          $http.get(reverseGeoUrl)
              .success(function (response) {
                  var result = "";
                  var location = response.address.city || response.address.town || response.address.village || "";
                  result = location+", "+response.address.state+', '+response.address.country;
                  element.display_name = element.display_name+' - '+result;
                  isLocationLoading = false;
              })
              .error(function () {
                  element.display_name = element.id+' - '+element.code;
                  isLocationLoading = false;
              });
      };

      /**
       * Find scatterer by scatterer code
       * @param code Scatterer code
       * @param callback Caback function to display results
       */
    this.getScattererByCode = function (code, callback){
        if (!((callback!==undefined) && (typeof callback==="function"))){
            return false;
        }
        if (code.length > 2) {
            var url = host+'/scatterers?code='+code;
            $http.get(url)
                .success(function (response) {
                    response.data.forEach(function (element){
                        var coord;
                        if (element.ps) {
                            coord = { "lon": element.ps.lon, "lat": element.ps.lat };
                        } else if (element.ds) {
                            coord = { "lon": element.ds.lon, "lat": element.ds.lat };
                        } else if (element.cr) {
                            coord = { "lon": element.cr.lon, "lat": element.cr.lat };
                        }
                        element.display_name = element.code;
                        isLocationLoading = true;
                        locateScatterer(coord, element);
                    });
                    var scatterers = response.data;
                    callback(scatterers, code.length);
                })
                .error(function () {
                    callback(null);
                });
            return true;
        } else {
            return false;
        }
    };

      /**
       * Find scatterer by unique composite code
       * @param scattererCode Scatterer composite unique code
       * @param callback Callback function to display results
       */
    this.getScattererByUniqueCode = function (scattererCode, callback){
        if (!((callback!==undefined) && (typeof callback==="function"))){
            return false;
        }

        if(scattererCode.split("-").length >= 4){
            // S01-0-dataset0-L09332P05970
            // S01-a863d25d-f1aa-44a7-bb4e-8d94959308b9-IW1-CR10_ASC
            var splitted = scattererCode.split("-");
            var sensor_code = splitted[0];
            var beam = splitted[splitted.length - 2];
            var code = splitted[splitted.length - 1];
            var supermaster = splitted.slice(1, splitted.length - 2).join("-");

            const url = host + '/scatterers?scatterer=' + code + '&supermaster=' + supermaster +
                '&beam=' + beam + '&sensor=' + sensor_code;
            $http.get(url)
                .success(function (response) {
                    if(response.data){
                        var element = response.data;
                        var coord;
                        if(element.ps) {
                            coord = { "lon": element.ps.lon, "lat": element.ps.lat };
                        } else if(element.ds) {
                            coord = { "lon": element.ds.lon, "lat": element.ds.lat };
                        } else if(element.cr) {
                            coord = { "lon": element.cr.lon, "lat": element.cr.lat };
                        }
                        element.display_name = element.code;
                        isLocationLoading = true;
                        locateScatterer(coord, element);
                        var scatterers = [element];
                        callback(scatterers, scattererCode.length);
                    }
                })
                .error(function () {
                    callback(null);
                });
            return true;
        } else {
            return false;
        }
    };

    /**
		 * Parameters:
		 * coord - {Object}
		 * callback - {Function}
     *
		 * Returns:
		 * {String} - Address Message
		 */
    this.reverse = function(coord,callback){
      if (!((callback!==undefined) && (typeof callback==="function"))){
        return;
      }
      try {
          var url = configuration.geocoder.urlReverse+'lat='+coord.lat+'&lon='+coord.lon+configuration.geocoder.paramsReverse;
            $http.get(url)
              .success(function (response) {
                var result = "";
                var location = response.address.city || response.address.town || response.address.village || "";
                result = location+", "+response.address.state+', '+response.address.country;
                callback(result);
              })
              .error(function (response) { // jshint ignore:line
                //HTTP STATUS != 200
                callback("");
              });
		    	} catch (e) {
		    		console.log("[GeocodingService :: reverse] EXCEPTION : '"+e);
            callback("");
			} finally {
        //do nothing
			}
		};
  }]);
