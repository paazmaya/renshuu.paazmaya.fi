define([
  'lib/underscore',
  'lib/jquery',
  'lib/backbone',
  'lib/leaflet'
], function(
  _,
  $,
  Backbone,
  L
) {
  'use strict';
  
  var TrainingList = Backbone.Model.extend({
    initialize: function (options) {

    }
  });
  
  return TrainingList;
});