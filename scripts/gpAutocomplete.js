'use strict';

/**
 * A directive for adding google places autocomplete to a text box
 * google places autocomplete info: https://developers.google.com/maps/documentation/javascript/places
 *
 * Simple Usage:
 *
 * <input type="text" gp-autocomplete="result"/>
 *
 * creates the autocomplete text box and gives you access to the result
 *
 *   + `gp-autocomplete="result"`: specifies the directive, $scope.result will hold the textbox result
 *
 *
 * Advanced Usage:
 *
 * <input type="text" gp-autocomplete="result" gpDetails="details" gpOptions="options"/>
 *
 *   + `gp-autocomplete="result"`: specifies the directive, $scope.result will hold the textbox autocomplete result
 *
 *   + `gpDetails="details"`: $scope.gpDetails will hold the autocomplete's more detailed result; latlng. address components, etc.
 *
 *   + `gpOptions="options"`: options provided by the user that filter the autocomplete results
 *
 *      + options = {
 *           types: type,        string, values can be 'geocode', 'establishment', '(regions)', or '(cities)'
 *           bounds: bounds,     google maps LatLngBounds Object
 *           country: country    string, ISO 3166-1 Alpha-2 compatible country code. examples; 'ca', 'us', 'gb'
 *         }
 *
 *
 */

/*
 Note: beware naming convention and invoking
       name must be camelCased, invoking adds a dash where capital letters live e.g., camel-cased (also lower case everything!)
*/
angular.module( "gpAutocomplete", [])
  .directive('gpAutocomplete', function($parse) {
      
    return {

        /*
         Regarding: isolate scope property where '='
        */
        scope: {
            gpOptions: '=',
            gpDetails: '=',
            gpAutocomplete: '='
        },

      link: function(scope, element, attrs, model) {

        //options for autocomplete
        var opts

        //convert options provided to opts
        var initOpts = function() {
          opts = {}
          if (scope.gpOptions) {
            if (scope.gpOptions.types) {
              opts.types = []
              opts.types.push(scope.gpOptions.types)
            }
            if (scope.gpOptions.bounds) {
              opts.bounds = scope.gpOptions.bounds
            }
            if (scope.gpOptions.country) {
              opts.componentRestrictions = {
                country: scope.gpOptions.country
              }
            }
          }
        }
        initOpts()

        //create new autocomplete
        //reinitializes on every change of the options provided
        var newAutocomplete = function() {

            var gpData = {};
            var gpGeom = '';

            scope.gp = new google.maps.places.Autocomplete(element[0], opts);
            google.maps.event.addListener(scope.gp, 'place_changed', function() {

                scope.$apply(function() {

                    gpData = scope.gp.getPlace();
                    if (typeof(gpData) != "undefined" && gpData.geometry){
                        gpGeom = gpData.geometry.location.lat() + ',' + gpData.geometry.location.lng();
                    }
                    scope.gpDetails = gpGeom;
                    scope.gpAutocomplete = element.val();
                });
            })
        }
        newAutocomplete()

        //watch options provided to directive
        scope.watchOptions = function () {
          return scope.gpOptions
        };
        scope.$watch(scope.watchOptions, function () {
          initOpts()
          newAutocomplete()
          element[0].value = '';
          scope.gpAutocomplete = element.val();
        }, true);
      }
    };
  });
