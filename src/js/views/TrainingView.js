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
  
  var TrainingView = Backbone.View.extend({
    initialize: function (options) {

    },

    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });
  
  return TrainingView;
});