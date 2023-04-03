'use strict';

angular
	.module('services.config',[])
	.constant('configuration', {
		//common environment configuration
		rheticusHeaderImage : "@@rheticusHeaderImage",
		timeSlider : @@timeSlider,
		filters : @@filters,
		map : @@map,
		dataProviders : @@dataProviders,
		geocoder : @@geocoder,
		cesiumViewer : @@cesiumViewer,
		//custom environment configuration
		layers : @@layers,
		rheticusAPI : @@rheticusAPI
	});
