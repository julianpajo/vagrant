'use strict';

/**
 * @ngdoc function
 * @name rheticus.controller:LoginPopupCtrl
 * @description
 * # LoginPopupCtrl
 * Login Popup Controller for rheticus project
 */
angular.module('rheticus')
 	.controller('LoginPopupCtrl',['$rootScope','$scope','$mdDialog','AuthenticationService', 'SessionService',
    function($rootScope,$scope,$mdDialog,AuthenticationService, SessionService){

      var self = this; //this controller
      //var showLoading = false;
      var getLoginStatus = function () {
				return $rootScope.login.logged;
			};

      var getUserDetails = function () {
        var userDetails = {"username" : "", "name" : "", "surname" : "","company_name":""};
        if (($rootScope.login.details!==null) && $rootScope.login.details.info && ($rootScope.login.details.info!==null)){
          userDetails = {
            "username" : ($rootScope.login.details.info.username) ? $rootScope.login.details.info.username : "",
            "name" : ($rootScope.login.details.info.name) ? $rootScope.login.details.info.name : "",
            "surname" : ($rootScope.login.details.info.surname) ? $rootScope.login.details.info.surname : "",
            "bookmarks": ($rootScope.login.details.info.bookmark_entities) ? $rootScope.login.details.info.bookmark_entities : [],
            "organization_entity.id": $rootScope.login.details.info.organization_entity.id,
            "company_name" : ($rootScope.login.details.info.organization_entity.company_name) ? $rootScope.login.details.info.organization_entity.company_name : "",
          /*  "email" : ($rootScope.login.details.info.email) ? $rootScope.login.details.info.email : "",
            "layer" : ($rootScope.login.details.info.layer) ? $rootScope.login.details.info.layer : ""*/
          };
        }
        return userDetails;
      };

      var login = function () {
        self.showLoading=true;
				$scope.dataLoading = true;
				AuthenticationService.Login(self.username,self.password,
          function(response) {
            self.user = "";
            if(response.username === self.username) {
  						AuthenticationService.SetCredentials(self.username,self.password,response.organization_entity.geoserver_username, response.organization_entity.geoserver_password, response);
              self.user = getUserDetails().name + " " + getUserDetails().surname;
              self.error = null;
              $mdDialog.hide();
              document.getElementById('userNameView').innerHTML=getUserDetails().username+" ( "+getUserDetails().company_name+" )";
  					} else {
  						self.error = response.message;
  					}
            self.dataLoading = false;
            self.showLoading = false;
  				}
        );
			};
      var logout = function () {
        AuthenticationService.ClearCredentials();
        SessionService.deleteKey("period");
        $mdDialog.hide();
        document.getElementById('userNameView').innerHTML="";
			};

      angular.extend(self,{
        "showLoading" : false,
        "dataLoading" : false,
        "error" : null,
        "username" : "",
        "password" : "",
        "user" : getUserDetails().name + " " + getUserDetails().surname,
        "company_name": getUserDetails().company_name,
        "login" : login,
        "logout" : logout,
        "getLoginStatus" : getLoginStatus
  		});
		}]
	);
