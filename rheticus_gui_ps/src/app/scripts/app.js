'use strict';

/**
 * @ngdoc overview
 * @name rheticus
 * @description
 * # rheticus
 *
 * Main module for rheticus project
 */

angular
	//modules addition
	.module('rheticus', [
		'ngAnimate',
		'ngMaterial',
		'ngMessages',
		'ngCookies',
		'ngResource',
		'ngRoute',
		'ngSanitize',
		'openlayers-directive',
		'openlayers-layerswitcher',
		'ui.bootstrap',
		'nvd3',
		'smart-table',
		'services.config',
		'flash',
		'pascalprecht.translate',
		'ngFileSaver',
		'ngStorage'
	])

	//routing configuration
	.config(['$routeProvider', 'configuration', function ($routeProvider, configuration) {
		$routeProvider
			.when('/', {
				"templateUrl": "scripts/components/main/main-view.html",
				"controller": "MainCtrl",
				"controllerAs": "main",
				"reloadOnSearch": false				
			})			
			.when('/about', {
				"templateUrl": "scripts/components/about/about-view.html",
				"controller": "AboutCtrl",
				"controllerAs": "about"
			})
			.when('/3d', {
				"redirectTo": function () {
					window.location = configuration.cesiumViewer.url;
				}
			})
			.otherwise({
				"redirectTo": "/"
			});
	}])
	.constant("ANONYMOUS_USER", {
		"username": "anonymous",
		"password": "pwdanonymous"
	})
	.config(['$httpProvider', function ($httpProvider) { // provider-injector
		$httpProvider.interceptors.push('LoginInterceptor');
	}])
	.run(['$rootScope', '$cookies', 'ANONYMOUS_USER', 'ArrayService', 'AuthenticationService', 'configuration', '$http', 'StorageService',
		function ($rootScope, $cookies, ANONYMOUS_USER, ArrayService, AuthenticationService, configuration, $http, StorageService) {
			
			var configurationText = JSON.stringify(configuration)
				.replace(/locationHost/g, document.location.host)
				.replace(/locationProtocol/g, document.location.protocol);
			var configurationCurrentHost = JSON.parse(configurationText);

			angular.extend($rootScope, {
				"configurationCurrentHost": configurationCurrentHost,
				"markerVisibility": false,
				"login": {
					"logged": false,
					"details": null
				},
				"anonymousDetails": null,
				"period": "g"
			});

			$rootScope.login.details = ($rootScope.login.details === null) ? (StorageService.getData('rheticus.login.details') || null) : null;

			$rootScope.login.logged = $rootScope.login.details !== null;

			if (($rootScope.login.details !== null) &&
				$rootScope.login.details.info && ($rootScope.login.details.info !== null) &&
		$rootScope.login.details.info.username && ($rootScope.login.details.info.username !== ANONYMOUS_USER.username)) {

				if($rootScope.login.details.hasOwnProperty("geoserver_authdata")){ // checks for up-to-date localstorage object
					AuthenticationService.resumeUser($rootScope.login.details.authdata, $rootScope.login.details.geoserver_authdata);
				} else {
					StorageService.deleteKey('rheticus.login.details');
					AuthenticationService.DemoLogin();
				}
			} else {
				AuthenticationService.DemoLogin();
			}
			// redirect to login page if not logged in and trying to access a restricted page
			/*$rootScope.$on('$locationChangeStart', function (event, next, current) {
	          var restrictedPage = $.inArray($location.path(), ['/login', '/register']) === -1;
	          var loggedIn = $rootScope.globals.currentUser;
	          if (restrictedPage && !loggedIn) {
	              $location.path('/login');
	          }
	      });*/
		}
	]
	);


