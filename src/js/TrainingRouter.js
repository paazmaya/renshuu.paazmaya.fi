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
  
  var TrainingRouter = Backbone.Router.extend({
  
    routes: {
      'training': 'index',
      'training/:id': 'training'
    },

    initialize: function (options) {
      this.trainingList = options.trainingList; // model
    },

    index: function () {
      this.trainingList.fetch();
    },

    training: function (id) {

    }
  });
  
  return TrainingRouter;
});