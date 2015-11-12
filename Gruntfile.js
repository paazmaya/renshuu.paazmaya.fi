/**
 * renshuu.paazmaya.com
 * https://github.com/paazmaya/renshuu.paazmaya.com
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (http://paazmaya.fi)
 * Licensed under the MIT license.
 */
'use strict';

module.exports = function gruntConf(grunt) {
  require('time-grunt')(grunt); // Must be first item

  grunt.initConfig({

    copy: {
      bower: {
        files: [
          {
            expand: true,
            flatten: true,
            cwd: 'bower_components/',
            src: [
              'requirejs/require.js',
              'underscore/underscore.js',
              'jquery/jquery.js',
              'backbone/backbone.js'
            ],
            dest: 'src/js/lib/',
            filter: 'isFile'
          },
          {
            expand: true,
            cwd: 'bower_components/leaflet/src/',
            src: [
              '**/*.js'
            ],
            dest: 'src/js/lib/',
            filter: 'isFile'
          },
          {
            expand: true,
            flatten: true,
            src: 'bower_components/qunit/qunit/*.*',
            dest: 'test/qunit',
            filter: 'isFile'
          }
        ]
      }
    },

    eslint: {
      options: {
        config: '.eslintrc',
        format: 'stylish'
      },
      target: [
        'Gruntfile.js',
        'src/js/main.js'
      ]
    },

    connect: {
      qunit: {
        options: {
          port: 9991,
          base: '.'
          //keepalive: true
        }
      }
    },

    qunit: {
      all: {
        options: {
          urls: [
            'http://localhost:9991/test/index_spec.html'
          ]
        }
      }
    },

    watch: {
      main: {
        files: 'src/js/main.js',
        tasks: ['eslint', 'test']
      }
    },

    requirejs: {
      compile: {
        options: {
          name: 'main',
          baseUrl: 'src/js/',
          mainConfigFile: 'src/js/main.js',
          out: 'src/js/optimized.js',
          optimize: 'uglify2' // 116 KB
          //optimize: 'none' // 341 KB
        }
      }
    }

  });

  require('jit-grunt')(grunt);

  grunt.registerTask('default', ['test']);
  grunt.registerTask('test', ['eslint', 'connect', 'qunit']);

};
