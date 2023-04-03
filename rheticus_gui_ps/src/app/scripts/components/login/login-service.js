'use strict';

/**
 * @ngdoc function
 * @name rheticus.service:AuthenticationService
 * @description
 * # AuthenticationService
 * Authentication Service for rheticus project
 */
angular.module('rheticus')
	.factory('AuthenticationService', ['Base64', '$http', '$cookies', '$rootScope', 'ArrayService', 'SessionService', 'StorageService', 'ANONYMOUS_USER',
		function (Base64, $http, $cookies, $rootScope, ArrayService, SessionService, StorageService, ANONYMOUS_USER) {
			var service = {};

			service.resumeUser = function (authData, geoserverAuthdata) {
				var decoded = Base64.decode(authData).split(":");
				var username = decoded[0];
				var password = decoded[1];

				var decodedGeoserver = Base64.decode(geoserverAuthdata).split(":");
				var usernameGeoserver = decodedGeoserver[0];
				var passwordGeoserver = decodedGeoserver[1];

				service.Login(username, password, function (response) {
					if (response.username === username) {
						service.SetCredentials(username, password, usernameGeoserver, passwordGeoserver, response);
					}
				})
			};

			service.Login = function (username, password, callback) {
				SessionService.deleteKey("token");

				var clientId = "rheticusClient";
				var clientSecret = "networkWizard";
				var authurl = $rootScope.configurationCurrentHost.rheticusAPI.host +
					$rootScope.configurationCurrentHost.rheticusAPI.authentication +
					"?" + new Date().getTime();
				var postObj = "clientId=" + clientId +
					"&clientSecret=" + clientSecret +
					"&username=" + username +
					"&password=" + password +
					"&grant_type=" + "password";

				var authdata = Base64.encode(clientId + ":" + clientSecret);
				$http.defaults.headers.common.Authorization = "Basic " + authdata

				$http.post(authurl, postObj, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
					.success(function (data, status, headers, config) {
						SessionService.setData("token", data.access_token);

						$rootScope.period = SessionService.getData("period") || "g";
						delete $http.defaults.headers.common.Authorization;

						var timeStamp = new Date(); // big workaround for explorer cache problem with same link
						var authUrl = $rootScope.configurationCurrentHost.rheticusAPI.host +
							$rootScope.configurationCurrentHost.rheticusAPI.userDetails +
							"?" + timeStamp.getTime();

						$http.get(authUrl)
							.success(function (response) { // jshint ignore:line
								$rootScope.login.logged = response.username !== ANONYMOUS_USER.username;
								SessionService.setData('customBaseMap', response.basemap);
								$rootScope.$broadcast('updateBaseMap', response.basemap);

								$rootScope.login.details = {
									"authdata": Base64.encode(response.username + ":" + response.password),
									"geoserver_authdata": Base64.encode(response.organization_entity.geoserver_username + ":" + response.organization_entity.geoserver_password),
									"info": response
								};
								$rootScope.login.details.selectedArea = $rootScope.login.logged ? "" : 'NISCEMI-GELA';
								if (response.username) {
									callback(response);
								} else {
									callback({ message: "Couldn't retrieve the username!" });
								}
							})
							.error(function (response) { // jshint ignore:line
								console.log(response);
							});
					})
					.error(function (data, status, header, config) {
						console.log("error");
						//HTTP STATUS != 200
						var message = (data.code && (data.code !== "")) ? data.code : "";
						message += (data.message && (data.message !== "")) ? ((message !== "") ? " : " : "") + response.message : "";
						callback({ "message": message });
					});
			};

			service.DemoLogin = function () {
				service.Login(ANONYMOUS_USER.username, ANONYMOUS_USER.password, function (response) { });
			};

			service.SetCredentials = function (username, password, usernameGeoserver, passwordGeoserver, response) {
				var authdata = Base64.encode(username + ":" + password);
				var authdataGeoserver = Base64.encode(usernameGeoserver + ":" + passwordGeoserver);
				$http.defaults.headers.common['Authorization'] = "Basic " + authdata; // jshint ignore:line
				$rootScope.login.logged = true;
				var details = {
					"authdata": authdata,
					"geoserver_authdata": authdataGeoserver,
					"info": JSON.parse(JSON.stringify(response))
				};
				
				details.info.organization_entity.deals = [details.info.organization_entity.deals[0]];
				for (var i = 0; i < details.info.organization_entity.deals.length - 1; i++) {
					for (var j = i + 1; j < details.info.organization_entity.deals; j++) {
						if (details.info.organization_entity.deals[i].product_name > details.info.organization_entity.deals.product_name) {
							var tempDeal = details.info.organization_entity.deals[i];
							details.info.organization_entity.deals[i] = details.info.organization_entity.deals[j];
							details.info.organization_entity.deals[j] = tempDeal;
						}
					}
				}

				StorageService.setData('rheticus.login.details', details);
				//$cookies.putObject('rheticus.login.details', $rootScope.login.details);
				//SEND GOOGLE ANALYTICS LOGIN EVENT
				ga('send', {
					hitType: 'event',
					eventCategory: 'User info',
					eventAction: 'login',
					eventLabel: username
				});
				//console.log("ga send"+username);
			};
			service.ClearCredentials = function () {
				delete $http.defaults.headers.common['Authorization'];
				$rootScope.login.logged = false;
				if ($rootScope.anonymousDetails) {
					$rootScope.login.details = ArrayService.cloneObj($rootScope.anonymousDetails); //null;
				} else {
					service.DemoLogin();
				}
				StorageService.deleteKey('rheticus.login.details');
			};
			return service;
		}])

	.factory('Base64', function () {
		/* jshint ignore:start */
		var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
		return {
			encode: function (input) {
				var output = "";
				var chr1, chr2, chr3 = "";
				var enc1, enc2, enc3, enc4 = "";
				var i = 0;
				do {
					chr1 = input.charCodeAt(i++);
					chr2 = input.charCodeAt(i++);
					chr3 = input.charCodeAt(i++);
					enc1 = chr1 >> 2;
					enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
					enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
					enc4 = chr3 & 63;
					if (isNaN(chr2)) {
						enc3 = enc4 = 64;
					} else if (isNaN(chr3)) {
						enc4 = 64;
					}
					output = output +
						keyStr.charAt(enc1) +
						keyStr.charAt(enc2) +
						keyStr.charAt(enc3) +
						keyStr.charAt(enc4);
					chr1 = chr2 = chr3 = "";
					enc1 = enc2 = enc3 = enc4 = "";
				} while (i < input.length);
				return output;
			},
			decode: function (input) {
				var output = "";
				var chr1, chr2, chr3 = "";
				var enc1, enc2, enc3, enc4 = "";
				var i = 0;
				// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
				var base64test = /[^A-Za-z0-9\+\/\=]/g;
				if (base64test.exec(input)) {
					window.alert("There were invalid base64 characters in the input text.\n" +
						"Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
						"Expect errors in decoding.");
				}
				input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
				do {
					enc1 = keyStr.indexOf(input.charAt(i++));
					enc2 = keyStr.indexOf(input.charAt(i++));
					enc3 = keyStr.indexOf(input.charAt(i++));
					enc4 = keyStr.indexOf(input.charAt(i++));
					chr1 = (enc1 << 2) | (enc2 >> 4);
					chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
					chr3 = ((enc3 & 3) << 6) | enc4;
					output = output + String.fromCharCode(chr1);
					if (enc3 != 64) {
						output = output + String.fromCharCode(chr2);
					}
					if (enc4 != 64) {
						output = output + String.fromCharCode(chr3);
					}
					chr1 = chr2 = chr3 = "";
					enc1 = enc2 = enc3 = enc4 = "";
				} while (i < input.length);
				return output;
			}
		};
		/* jshint ignore:end */
	});
