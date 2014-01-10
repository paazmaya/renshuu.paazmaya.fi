var gulp = require('gulp');
var uglify = require('gulp-uglify');

gulp.task('scripts', function() {
  gulp.src(['client/js/**/*.js', '!client/js/vendor/**'])
    .pipe(uglify())
    .pipe(gulp.dest('build/js'));

  gulp.src('client/js/vendor/**')
    .pipe(gulp.dest('build/js/vendor'));
});

gulp.task('default', function() {
  gulp.run('scripts');

  gulp.watch('client/js/**', function(event) {
    gulp.run('scripts');
  });
});