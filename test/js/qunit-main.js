

"use strict";
require.config({
    baseUrl: '/src/js/lib/',
    paths: {
        'qunit': '/test/qunit/qunit'
    },
    shim: {
       'qunit': {
           exports: 'QUnit',
           init: function() {
               QUnit.config.autoload = false;
               QUnit.config.autostart = false;
           }
       },
      'underscore': {exports: '_'},
      'jquery': {exports: '$'},
      'backbone': {exports: 'Backbone'},
      'Leaflet': {exports: 'L'}
    }
});

require(
    ['qunit', '/test/js/main_spec.js'],
    function(QUnit, indexSpec) {
        QUnit.load();
        QUnit.start();
        indexSpec.run();
        
    }
);
