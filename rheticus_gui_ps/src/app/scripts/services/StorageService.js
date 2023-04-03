'use strict';

/**
 * @ngdoc function
 * @name rheticus.service:SpatialService
 * @description
 * # SpatialService
 * Spatial Service for rheticus project
 */
angular.module('rheticus')
  .service('StorageService', ['$localStorage', function($localStorage){

    var setValue = function(key, value){
      $localStorage[key] = value;
    }

    var getValue = function(key){
    	return $localStorage[key] ? $localStorage[key] : null;
    }

    var deleteKey = function(key){
      delete $localStorage[key];
    }

    return {
    	'setData': setValue,
    	'getData':getValue,
      'deleteKey': deleteKey 
    }

  }]);
