'use strict';

/**
 * @ngdoc function
 * @name rheticus.service:SpatialService
 * @description
 * # SpatialService
 * Spatial Service for rheticus project
 */
angular.module('rheticus')
  .service('SessionService', ['$sessionStorage', function($sessionStorage){

    var setValue = function(key, value){
    	$sessionStorage[key] = value;
    }

    var getValue = function(key){
    	return $sessionStorage[key] ? $sessionStorage[key] : null;
    }

    var deleteKey = function(key){
      delete $sessionStorage[key];
    }

    return {
    	'setData': setValue,
    	'getData':getValue,
      'deleteKey': deleteKey 
    }

  }]);
