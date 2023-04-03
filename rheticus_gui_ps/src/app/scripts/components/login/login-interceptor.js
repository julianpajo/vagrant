'use strict';

/**
 * @ngdoc function
 * @name rheticus.interceptor:LoginInterceptor
 * @description
 * # LoginInterceptor
 * Change authorization header values based on requested url.
 * Handle Geoserver and REST API cases
 */
angular.module('rheticus')
  .service('LoginInterceptor', function ($rootScope, $q, SessionService) {
    var service = this;
    service.request = function (config) {
      if (config.url.indexOf("rheticusapi") !== -1) {
        var access_token = SessionService.getData("token");
        if (access_token) {
          config.headers.Authorization = "Bearer " + access_token;
        }
      } else if (config.url.indexOf("geoserver") !== -1) {
        if ($rootScope.login.details.geoserver_authdata) {
          config.headers.Authorization = "Basic " + $rootScope.login.details.geoserver_authdata;
        }
      }
        return config;
      };

      service.responseError = function (response) {
        return $q.reject(response);
      };
    });
