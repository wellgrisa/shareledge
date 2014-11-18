var gulp = require('gulp'),
		concat = require('gulp-concat'),
		jshint = require('gulp-jshint'),
		uglify = require('gulp-uglify');

gulp.task('build', ['minify-js', 'minify-css']);

gulp.task('minify-js', function () {
	gulp.src('public/lib/**/*.js')	 		
	.pipe(uglify())
	.pipe(concat('app.js'))
	.pipe(gulp.dest('public/build'))
});

gulp.task('minify-css', function () {
	gulp.src('public/css/*.css')
	.pipe(uglify())
	.pipe(gulp.dest('public/build'))
});