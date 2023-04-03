'use strict';

/**
 * @ngdoc function
 * @name rheticus.directive:draggable
 * @description
 * # draggable
 * draggable directive for rheticus project
 */
angular.module('rheticus')
  .directive('draggable', function($document) {
    return function(scope, element, attr) { // jshint ignore:line
      var startX = 0, startY = 0, x = 600, y = 600;
      element.css({
        cursor: 'pointer'
      });
      element.on('mousedown', function(event) {
        element.css({
          border: '1px solid red'
        });
        // Prevent default dragging of selected content
        event.preventDefault();
        startX = event.clientX - x;
        startY = event.clientY - y;
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      });
      function mousemove(event) {
        y = event.clientY - startY;
        x = event.clientX - startX;
        element.css({
          top: y + 'px',
          left:  x + 'px',
          border: '1px solid red'
        });
      }
      function mouseup() {
        $document.off('mousemove', mousemove);
        $document.off('mouseup', mouseup);
        element.css({
          border: '0px solid red'
        });
      }
    };
  });
