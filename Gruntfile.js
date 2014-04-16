/**
 * grunt-togeojson
 * https://github.com/paazmaya/grunt-togeojson
 *
 * Copyright (c) Juga Paazmaya <olavic@gmail.com>
 * Licensed under the MIT license.
 */
'use strict';

module.exports = function(grunt) {

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
        config: 'eslint.json',
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

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-eslint');

  grunt.registerTask('default', ['test']);
  grunt.registerTask('test', ['eslint', 'connect', 'qunit']);

};
