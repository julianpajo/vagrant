'use strict';

/**
 * @ngdoc function
 * @name rheticus.controller:HeaderCtrl
 * @description
 * # HeaderCtrl
 * Header Controller for rheticus project
 */
angular.module('rheticus')
	.controller('HeaderCtrl',['configuration',function (configuration){
		angular.extend(this,{
			"rheticusHeaderImage" : configuration.rheticusHeaderImage
		});
	}]);
