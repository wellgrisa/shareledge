var gulp = require('gulp'),		
		console = require('better-console'),
		plugins = require('gulp-load-plugins')();		

var paths = {
	scripts: ['public/lib/**/*.js', '!public/lib/**/*.min.js', '!public/lib/**/jquery*.js'],
	server: {
		index: 'server.js'
	}
};

gulp.task('default', ['server']);

//gulp.task('default', ['clean'], function() {
//	return gulp.start('minify-js', 'minify-css');
//});

gulp.task('clean', function() {
	return gulp.src(['public/build/*'], {read: false}).pipe(plugins.clean());
});

gulp.task('server', function(){
	plugins.nodemon({script: paths.server.index})
	.on('start', function() {
		console.clear();
	}).on('restart', function() {
		console.clear();
	});
});

gulp.task('minify-js', function () {
	gulp.src(paths.scripts)
	.pipe(plugins.react())
	.pipe(plugins.uglify().on('error', function(e) { console.log('\x07',e.message); return this.end(); }))
	.pipe(plugins.concat('app.js'))
	.pipe(plugins.rename({suffix: '.min'}))
	.pipe(gulp.dest('public/build'))
});

gulp.task('minify-css', function () {
	gulp.src('public/css/*.css')
	.pipe(plugins.concat('style.css'))
	.pipe(plugins.minifyCss())	
	.pipe(gulp.dest('public/build'))
});