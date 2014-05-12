var gulp = require('gulp');
var eslint = require('gulp-eslint');
var connect = require('gulp-connect');
var qunit = require('gulp-qunit');
var less = require('gulp-less');
//var requirejs = require('gulp-requirejs');

// How to?  grunt.loadNpmTasks('grunt-contrib-watch');


gulp.task('copy', function() {
  return gulp.src([
    'bower_components/requirejs/require.js',
    'bower_components/underscore/underscore.js',
    'bower_components/jquery/jquery.js',
    'bower_components/backbone/backbone.js',
    'bower_components/leaflet/src/**/*.js'
   ])
   .pipe(gulp.dest('src/js/lib/'));
});

gulp.task('eslint', function () {
  gulp.src([
        'Gruntfile.js',
        'src/js/main.js'
      ])
    .pipe(eslint({config: 'eslint.json'}))
    .pipe(eslint.format('compact'));
});

gulp.task('qunit', function() {
  gulp.src(['bower_components/qunit/qunit/*.*'])
   .pipe(gulp.dest('test/qunit'));
  
  connect.server({
    root: ['app'],
    port: 9991
  });
  return gulp.src('http://localhost:9991/test/index_spec.html')
      .pipe(qunit());
});

gulp.task('less', function() {
  return gulp.src('css/app.less')
    .pipe(less())
    .pipe(gulp.dest('dist'));
});

gulp.task('test', function() {
  gulp.run('eslint');
  gulp.run('qunit');
});

gulp.task('default', function() {
  gulp.run('test');
});

gulp.task('watch', ['less'], function() {
  gulp.watch('css/**/*.less', ['less']);
});
