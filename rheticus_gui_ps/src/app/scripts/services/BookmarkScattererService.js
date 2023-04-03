angular.module('rheticus')
    .service('BookmarkScattererService', function($http, configuration){
        var service = {};
        var host = configuration.rheticusAPI.host
            .replace("locationHost", document.location.host)
            .replace("locationProtocol", document.location.protocol);
        var bookmarksScattererList = [];
        var bookmarksScattererDict = {};

        service.emptyBookmarksScattererList = function(){
            while(bookmarksScattererList.length > 0) {
                bookmarksScattererList.pop();
            }
        };

        service.updateBookmarkScattererList = function (){
            const apiUrl = host + '/bookmarks_scatterer';
            $http.get(apiUrl)
                .success(function (httpResponse) {
                    service.emptyBookmarksScattererList();
                    httpResponse.data.forEach(function(record){
                        record.editing = false;
                        bookmarksScattererList.push(record);
                    });
                })
                .error(function () {
                });
        };

        service.updateBookmarkScattererDict = function(){
            var apiUrl = host + '/bookmarks_scatterer';
            $http.get(apiUrl)
                .success(function (httpResponse) {
                    var bookmarksScatterer = httpResponse.data;

                    Object.keys(bookmarksScattererDict).forEach(function(key) {
                        bookmarksScattererDict[key] = false;
                    });

                    bookmarksScatterer.forEach(function(bs){
                        bookmarksScattererDict[bs.scatterer_entity.id] = true;
                    });
                })
                .error(function () {
                });
        };

        service.removeBookmarkScatterer = function(bookmarkScattererId){
            for(var i=0; i<bookmarksScattererList.length; i++){
                if(bookmarksScattererList[i].id === bookmarkScattererId){
                    bookmarksScattererList.splice(i, 1);
                    break;
                }
            }
        };

        service.getBookmarkScattererDict = function(){
            return bookmarksScattererDict;
        };

        service.getBookmarkScattererList = function(){
            return bookmarksScattererList;
        };

        service.setBookmarkScattererDictValue = function (key, value){
            bookmarksScattererDict[key] = value;
        };

        return service;
    });
