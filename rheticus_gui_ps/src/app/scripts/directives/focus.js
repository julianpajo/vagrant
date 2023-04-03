'use strict';

angular.module('rheticus').directive('mooFocusExpression', function ($timeout) {
    return {
        restrict: 'A',
        link: {
            post: function postLink(scope, element, attrs) {
                scope.$watch(attrs.mooFocusExpression, function (value) {

                    if (attrs.mooFocusExpression) {
                        if (scope.$eval(attrs.mooFocusExpression)) {
                            $timeout(function () {
                                element[0].focus();
                            }, 100); //need some delay to work with ng-disabled
                        }
                    }
                });
            }
        }
    };
});
