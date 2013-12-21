define([
  'underscore',
  'jquery',
  'backbone',
  'Leaflet'
], function(_, $, Backbone, L) {
  'use strict';
  var run = function() {
  
    test('phantomJS driver support', function() {
    
      equal(_.VERSION, '1.5.2', 'has underscore loaded');
      equal($.fn.jquery, '2.0.3', 'has jQuery loaded');
      equal(Backbone.VERSION, '1.1.0', 'has Backbone loaded');
      equal(L.version, '0.7.1', 'has Leaflet loaded');
      
    });
    
  };
  return {run: run};
});