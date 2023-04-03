'use strict';
angular.module('rheticus')
  .controller('ToolbarCtrl', function ($scope, $rootScope, $translate, $mdSidenav, $mdDialog, Flash, olData) {

    $scope.changeLanguage = function (langKey) {
      if (langKey === "it") {
        Flash.create("success", "Lingua cambiata con successo.");
      } else if (langKey === "gr") {
        Flash.create("success", "H γλώσσα άλλαξε με επιτυχία.");
      } else if (langKey === "sq") {
        Flash.create("success", "Gjuha ndryshua me sukses.");
      } else if (langKey === "pl") {
        Flash.create("success", "Język został pomyślnie zmieniony.");
      } else if (langKey === "es") {
        Flash.create("success", "Idioma cambiado correctamente.");
      } else if (langKey === "zh-cn") {
        Flash.create("success", "语言更改成功.");
      } else if (langKey === "fr") {
        Flash.create("success", "La langue a changé avec succès.");
      } else if (langKey === "nl") {
        Flash.create("success", "Taal is succesvol gewijzigd.");
      } else {
        Flash.create("success", "Language changed successfully.");
      }
      $translate.use(langKey);
      if (!$scope.$$phase) {
        $scope.$apply();
      }

    };

    $scope.shareLink = function () {
      $scope.copyUrlWithLocation();
      $translate('successfullCopy').then(function (translatedValue) {
        Flash.create("success", translatedValue);
      });
    };

    var isSettingsSidenavOpen = false;
    var isFiltersSidenavOpen = false;
    var isAreasSidenavOpen = false;

    $scope.openSettingMenu = function () {
        olData.getMap('map-default').then(function (map) {
            const location = map.getView().getCenter();
            const zoom = map.getView().getZoom();
            isSettingsSidenavOpen = !isSettingsSidenavOpen;
            if(isSettingsSidenavOpen && (isAreasSidenavOpen || isFiltersSidenavOpen)) {
                isAreasSidenavOpen = false;
                isFiltersSidenavOpen = false;
            }
            $rootScope.$broadcast("actionOnSidenav", {sidenav: 'settings', open: isSettingsSidenavOpen});
            setTimeout(function(){
                map.getView().setCenter(location);
                map.getView().setZoom(zoom);
            }, 300);
            setTimeout(function (){
                $scope.mapsIds.forEach(function (id) {
                    olData.getMap(id).then(function (mapToUpdate){
                        mapToUpdate.updateSize();
                    });
                });
            }, 600);
        });
    };

    $scope.openFilterMenu = function () {
        olData.getMap('map-default').then(function (map) {
            const location = map.getView().getCenter();
            const zoom = map.getView().getZoom();
            isFiltersSidenavOpen = !isFiltersSidenavOpen;
            if(isFiltersSidenavOpen && (isAreasSidenavOpen || isSettingsSidenavOpen)) {
                isAreasSidenavOpen = false;
                isSettingsSidenavOpen = false;
            }
            $rootScope.$broadcast("actionOnSidenav", {sidenav: 'filters', open: isFiltersSidenavOpen});
            setTimeout(function(){
                map.getView().setCenter(location);
                map.getView().setZoom(zoom);
            }, 300);
            setTimeout(function (){
                $scope.mapsIds.forEach(function (id) {
                    olData.getMap(id).then(function (mapToUpdate){
                        mapToUpdate.updateSize();
                    });
                });
            }, 600);
        });
    };

    $scope.openAreaMenu = function () {
        olData.getMap('map-default').then(function (map) {
            const location = map.getView().getCenter();
            const zoom = map.getView().getZoom();
            isAreasSidenavOpen = !isAreasSidenavOpen;
            if(isAreasSidenavOpen && (isFiltersSidenavOpen || isSettingsSidenavOpen)) {
                isFiltersSidenavOpen = false;
                isSettingsSidenavOpen = false;
            }
            $rootScope.$broadcast("actionOnSidenav", {sidenav: 'areas', open: isAreasSidenavOpen});
            setTimeout(function(){
                map.getView().setCenter(location);
                map.getView().setZoom(zoom);
            }, 300);
            setTimeout(function (){
                $scope.mapsIds.forEach(function (id) {
                    olData.getMap(id).then(function (mapToUpdate){
                        mapToUpdate.updateSize();
                    });
                });
            }, 600);
        });
    };

    $scope.closeDialog = function () {
      $mdDialog.hide();
    };

    $scope.showLoading = false;
    $(document).ready(function (){
        if(document.getElementById('userNameView')) {
            if (($rootScope.login.details !== null) && $rootScope.login.details.info && ($rootScope.login.details.info !== null)) {
                document.getElementById('userNameView').innerHTML = ($rootScope.login.details.info.username) ? $rootScope.login.details.info.username + " ( " + $rootScope.login.details.info.organization_entity.company_name + " )" : "";
            }
        }
    });

    var alert;
    $scope.showDialog = function ($event) {
      var parentEl = angular.element(document.querySelector('md-content'));
      alert = $mdDialog.alert({
        parent: parentEl,
        targetEvent: $event,
        clickOutsideToClose: true,
        templateUrl: 'scripts/components/login/login-popup.html'
      });

      $mdDialog
        .show(alert)
        .finally(function () {
          alert = undefined;
        });
    };

  });

angular.module('rheticus').config(function ($mdThemingProvider) {
  $mdThemingProvider.definePalette('amazingPaletteName', {
    '50': '003a57',
    '100': 'fbfbfb',
    '200': '003a57',
    '300': '003a57',
    '400': '003a57',
    '500': '003a57',
    '600': '003a57',
    '700': '003a57',
    '800': '003a57',
    '900': '003a57',
    'A100': '003a57',
    'A200': '003a57',
    'A400': '003a57',
    'A700': '003a57',
    'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
    // on this palette should be dark or light
    'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
      '200', '300', '400', 'A100'],
    'contrastLightColors': undefined    // could also specify this if default was 'dark'
  });
  $mdThemingProvider.theme('default')
    .primaryPalette('amazingPaletteName', {
      'default': '500',
      'hue-1': '50',
      'hue-2': '500',
    });
});



/**
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that can be in foundin the LICENSE file at http://material.angularjs.org/license.
**/
