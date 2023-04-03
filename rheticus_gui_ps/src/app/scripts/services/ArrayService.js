'use strict';

/**
 * @ngdoc function
 * @name rheticus.service:ArrayService
 * @description
 * # ArrayService
 * Array Service for rheticus project
 */
angular.module('rheticus')
  .service('ArrayService', function() {
    /**
     * Parameters:
     * list - {Object}
     * idValue - {String}
     *
     * Returns:
     * {Integer} - Position in list
     */
    this.getIndexByValue = function(list,idValue) {
      var res = -1;
      try {
        if (list && (list!==null) && (list.length>0)) {
          var i=0;
          for (i=0; i<list.length; i++){
            if (list[i]===idValue){
              res = i;
              break;
            }
          }
        }
      } catch (e) {
        console.log("[ArrayService :: getIndexByValue] EXCEPTION : '"+e);
      } finally {
        return(res);
      }
    };
    /**
     * Parameters:
     * list - {Object}
     * attribute - {String}
     * idValue - {String}
     *
     * Returns:
     * {Integer} - Position in list
     */
    this.getIndexByAttributeValue = function(list,attribute,idValue) {
      var res = -1;
      try {
        if (list && (list!==null) && (list.length>0)) {
          var i=0;
          if (attribute!==""){
            for (i=0; i<list.length; i++){
              if (eval("list[i]."+attribute)===idValue){ // jshint ignore:line
                res = i;
                break;
              }
            }
          } else {
            for (i=0; i<list.length; i++){
              if (list[i]===idValue){
                res = i;
                break;
              }
            }
          }
        }
      } catch (e) {
        console.log("[ArrayService :: getIndexByAttributeValue] EXCEPTION : '"+e);
      } finally {
        return(res);
      }
    };
    /**
     * APIMethod: cloneObj
     *
     * Parameters:
     * obj - {Object}
     *
     * Returns:
     * {Object}
     */
    this.cloneObj = function(obj) {
      var clone = null;
      if (obj!==null){
        clone = {};
        for (var p in obj)
          eval("clone."+p+" = obj[p];"); // jshint ignore:line
      }
      return clone;
    };
  });
