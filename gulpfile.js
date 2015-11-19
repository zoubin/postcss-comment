var gulp = require('gulp')

gulp.task('clean', function () {
  var del = require('del')
  return del('build')
})

gulp.task('scripts', ['clean'], function () {
  return gulp.src(['lib/**/*', 'hookRequire.js', 'index.js'], { base: process.cwd() })
    .pipe(gulp.dest('build'))
})

gulp.task('docs', ['clean'], function () {
  return gulp.src(['README.md', 'LICENSE', 'package.json'])
    .pipe(gulp.dest('build'))
})

gulp.task('build', ['scripts', 'docs'])

gulp.task('default', ['build'])

