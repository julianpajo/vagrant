"use strict";

/*
* Credits to : https://github.com/Yankovsky/nouislider-angular
* This code has been modified in order to take advantage of the noUiSlider multiple handles suppport
* See more: https://github.com/Yankovsky/nouislider-angular/issues/30
*/


angular.module('rheticus')
  .value('yaNoUiSliderConfig', {})
  .directive('yaNoUiSlider', ['$timeout', '$log', 'yaNoUiSliderConfig', function($timeout, $log, yaNoUiSliderConfig) {
    function toArray(val) {
      return angular.isArray(val) ? val : [val];
    }

    function copy(val) {
      return toArray(val).slice();
    }

    function equals(a, b) {
      a = toArray(a);
      b = toArray(b);

      if(a.length !== b.length){
        return false;
      } else {
        for(var i = 0; i < a.length; i++){
          if(a[i] != b[i]) return false;
        }
        return true;
      }
    }

    function omit(object, property) {
      var keys = Object.keys(object),
        index = -1,
        length = keys.length,
        result = {};

      while (++index < length) {
        var key = keys[index];
        if (key !== property) {
          result[key] = object[key];
        }
      }
      return result;
    }

    return {
      restrict: 'A',
      require: 'yaNoUiSlider',
      scope: {
        yaNoUiSlider: '=',
        yaNoUiSliderDisabled: '=',
        yaNoUiSliderHandle1Disabled: '=',
        yaNoUiSliderHandle2Disabled: '=',
        yaNoUiSliderSlideDebounce: '@'
      },
      controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
        var that = this,
          noUiSliderElement = $element[0],
          noUiSliderEvents = $scope.$parent.$eval($attrs.yaNoUiSliderEvents),
          slideDebounceDelay = $scope.yaNoUiSliderSlideDebounce || 0,
          events = slideDebounceDelay && slideDebounceDelay === 'Infinity' ? ['change'] : ['set', 'slide'],
          noUiSliderInstance,
          origins,
          sliderScope,
          pendingSlideDebounce;

        // allow to get noUiSlider instance from outside of that directive
        that.getNoUiSlider = function() {
          return noUiSliderInstance;
        };

        function toggleDisabled(element, newValue, oldValue) {
          if (newValue) {
            element.setAttribute('disabled', true);
          } else {
            element.removeAttribute('disabled');
          }
        }

        function destroy() {
          sliderScope.$destroy();
          noUiSliderInstance.off('slide change update slide');
          noUiSliderInstance.destroy();
          $timeout.cancel(pendingSlideDebounce);
        }

        function createSlider() {
          function updateValue(newValue) {
            if (!equals(newValue, latestValue)) {
              //console.log(newValue + " - " + latestValue);
              $scope.$applyAsync(function () {
                $scope.yaNoUiSlider.start = newValue;
              });
            }
          }

          sliderScope = $scope.$new();
          var options = angular.extend({}, yaNoUiSliderConfig, $scope.yaNoUiSlider);
          var latestValue = []; //copy(options.start);
          options.start = copy(options.start);
          noUiSlider.create(noUiSliderElement, options);
          origins = noUiSliderElement.getElementsByClassName('noUi-origin');
          noUiSliderInstance = noUiSliderElement.noUiSlider;

          sliderScope.$watch('yaNoUiSlider.start', function() {
            //console.log("sliderscope:" + $scope.yaNoUiSlider.start);
            var modelValue = $scope.yaNoUiSlider.start;
            if (!equals(modelValue, latestValue)) {
              latestValue = copy(modelValue);
              //noUiSliderInstance.set(copy(modelValue));
              $scope.$applyAsync(function () {
                noUiSliderEvents.set.apply(self, [latestValue]);
              });
            }
            return latestValue;
          });

          angular.forEach(events, function(eventName) {
            noUiSliderInstance.on(eventName + '.internal', function(values, handle, unencoded) {
              //console.log(eventName);
              if (eventName === 'slide' && slideDebounceDelay) {
                $timeout.cancel(pendingSlideDebounce);
                pendingSlideDebounce = $timeout(function() {
                  //console.log("update true");
                  updateValue(unencoded);
                }, slideDebounceDelay);
              } else if(eventName === 'set') {
                //console.log("update false");
                $timeout.cancel(pendingSlideDebounce);
                updateValue(unencoded);
              }
            });
          });

          sliderScope.$watch('yaNoUiSliderDisabled', toggleDisabled.bind(undefined, noUiSliderElement));
          sliderScope.$watch('yaNoUiSliderHandle1Disabled', toggleDisabled.bind(undefined, origins[0]));
          sliderScope.$watch('yaNoUiSliderHandle2Disabled', function(newValue, oldValue) {
            if (newValue) {
              if (!origins[1]) {
                return $log.warn('Warning: attempt to toggle disabled state of second handle using ya-no-ui-slider-handle2-disabled attribute in one-handle slider, nouislider-angular is ignoring such call.');
              }
              toggleDisabled(origins[1], newValue, oldValue);
            }
          });
        }

        function initialize() {
          $scope.$watch(function() {
            return omit($scope.yaNoUiSlider, 'start');
          }, function() {
            if (noUiSliderInstance) {
              destroy();
            }
            createSlider();
          }, true);

          $scope.$on('$destroy', destroy);
        }

        var initializeWatcher = $scope.$watch('yaNoUiSlider', function(options) {
          if (options) {
            initializeWatcher();
            initialize();
          }
        });
      }]
    }
  }]);
