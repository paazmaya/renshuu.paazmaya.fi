var gulp = require('gulp');
var eslint = require('gulp-eslint');
var copy = require('gulp-copy');
var connect = require('gulp-connect');
var qunit = require('gulp-qunit');
var requirejs = require('gulp-requirejs');

// How to?  grunt.loadNpmTasks('grunt-contrib-watch');


gulp.task('scripts', function() {
  gulp.src(['client/js/**/*.js', '!client/js/vendor/**'])
    .pipe(uglify())
    .pipe(gulp.dest('build/js'));

  gulp.src('client/js/vendor/**')
    .pipe(gulp.dest('build/js/vendor'));
});

gulp.task('copy', function() {

});

gulp.task('eslint', function () {
  gulp.src([
        'Gruntfile.js',
        'src/js/main.js'
      ])
    .pipe(eslint({config: 'eslint.json'}))
    .pipe(eslint.format());
});

gulp.task('test', function() {
  gulp.run('eslint');
  gulp.run('connect');
  gulp.run('qunit');
});

gulp.task('default', function() {
  gulp.run('test');
});
