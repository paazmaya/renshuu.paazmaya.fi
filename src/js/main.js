/**
 * Main loader
 */
require([
  'views/TrainingView',
  'models/TrainingList',
  'TrainingRouter'
], function(
  TrainingView,
  TrainingList,
  TrainingRouter
) {
  'use strict';

  var trainingList = new TrainingList();
  var router = new TrainingRouter({
    trainingList: trainingList
  });

  Backbone.history.start({
    pushState: true
  });

  var trainings = new Backbone.Screen();
});
