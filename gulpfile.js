'use strict';

// --------------------------------------------------
// Require
// --------------------------------------------------

// General
const gulp = require('gulp');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const gulpif = require('gulp-if');
const del = require('del');
const format = require('string-kit').format;
const pipeline = require('readable-stream').pipeline;

// CSS
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

// JS
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const terser = require('gulp-terser');

// Images
const imagemin = require('gulp-imagemin');

// --------------------------------------------------
// Settings & Configuration
// --------------------------------------------------

const styles = {
	enabled: true,
	clean: true,
	minify: true,
	sourcemaps: true,
	src: {
		styles: 'assets/sass/**/*.{scss,sass}'
	},
	dest: 'dist/css/'
};

const scripts = {
	enabled: true,
	clean: true,
	minify: true,
	sourcemaps: true,
	src: {
		scripts: ['assets/js/script-1.js', 'assets/js/script-2.js'],
		vendor: ['assets/js/script-3.js']
	},
	dest: 'dist/js/'
};

const images = {
	enabled: true,
	clean: true,
	src: 'assets/images/**/*.{png,jpg,gif,svg}',
	dest: 'dist/images/'
};

const fonts = {
	enabled: true,
	clean: true,
	src: 'assets/fonts/**/*',
	dest: 'dist/fonts/'
};

const buildTasks = [];

const watchTasks = [];

// --------------------------------------------------
// Error Handler
// --------------------------------------------------

const error = function(err) {
	const message =
		'\n' +
		`^rError:^ ${err.plugin} threw an error` +
		'\n' +
		`${err.messageOriginal}` +
		'\n' +
		`^rline ${err.line}^ in ^r${err.relativePath}^` +
		'\n';

	console.log(format(message));
};

// --------------------------------------------------
// Clean Destination Folders
// --------------------------------------------------

const clean = function(done) {
	const toDelete = [];

	if (styles.enabled && styles.clean) toDelete.push(styles.dest);

	if (scripts.enabled && scripts.clean) toDelete.push(scripts.dest);

	if (images.enabled && images.clean) toDelete.push(images.dest);

	if (fonts.enabled && fonts.clean) toDelete.push(fonts.dest);

	del.sync(toDelete);

	done();
};

// --------------------------------------------------
// Gulp: Compile Styles
// --------------------------------------------------

if (styles.enabled) {
	// Create a new build task
	const cssBuildTask = function(task) {
		const processors = [autoprefixer];

		if (styles.minify) processors.push(cssnano);

		gulp.task(task.buildName, function() {
			return pipeline(
				// Get the source files
				gulp.src(task.files),

				// Init the custom error handling
				plumber({
					errorHandler: error
				}),

				// Init the sourcemap
				gulpif(styles.sourcemaps, sourcemaps.init()),

				// Compile sass
				sass(),

				// Apply the PostCSS processors
				postcss(processors),

				// Rename the output file
				rename({
					basename: task.name
				}),

				// Output the sourcemap
				gulpif(styles.sourcemaps, sourcemaps.write('.')),

				// Output the compiled css
				gulp.dest(styles.dest)
			);
		});
	};

	// Create a new watch task
	const cssWatchTask = function(task) {
		gulp.task(task.watchName, function() {
			return gulp.watch(task.files, gulp.series(task.buildName));
		});
	};

	// Create tasks for each bundle in styles.src
	for (const [name, files] of Object.entries(styles.src)) {
		const task = {
			buildName: 'build:css:' + name,
			watchName: 'watch:css:' + name,
			name: name,
			files: files
		};

		cssBuildTask(task);
		cssWatchTask(task);

		buildTasks.push(task.buildName);
		watchTasks.push(task.watchName);
	}
}

// --------------------------------------------------
// Gulp: Compile Scripts
// --------------------------------------------------

if (scripts.enabled) {
	// Create a new build task
	const jsBuildTask = function(task) {
		gulp.task(task.buildName, function() {
			return pipeline(
				// Get the source files
				gulp.src(task.files),

				// Init the custom error handling
				plumber({
					errorHandler: error
				}),

				// Init the sourcemap
				gulpif(scripts.sourcemaps, sourcemaps.init()),

				// Combine the files and rename
				concat(task.name + '.js'),

				// Babel
				babel({
					presets: ['@babel/env']
				}),

				// Minify
				gulpif(scripts.minify, terser()),

				// Write the sourcemap
				gulpif(scripts.sourcemaps, sourcemaps.write('.')),

				// Output the compiled js
				gulp.dest(scripts.dest)
			);
		});
	};

	// Create a new watch task
	const jsWatchTask = function(task) {
		gulp.task(task.watchName, function() {
			return gulp.watch(task.files, gulp.series(task.buildName));
		});
	};

	// Create tasks for each bundle in scripts.src
	for (const [name, files] of Object.entries(scripts.src)) {
		const task = {
			buildName: 'build:js:' + name,
			watchName: 'watch:js:' + name,
			name: name,
			files: files
		};

		jsBuildTask(task);
		jsWatchTask(task);

		buildTasks.push(task.buildName);
		watchTasks.push(task.watchName);
	}
}

// --------------------------------------------------
// Gulp: Images
// --------------------------------------------------

if (images.enabled) {
	// Create a new build task
	gulp.task('build:images', function() {
		return pipeline(
			// Get the source files
			gulp.src(images.src),

			// Optimise PNG, JPEG, GIF and SVG images
			imagemin(),

			// Output
			gulp.dest(images.dest)
		);
	});

	// Create a new watch task
	gulp.task('watch:images', function() {
		return gulp.watch(images.src, gulp.series('build:images'));
	});

	// Add tasks to task lists
	buildTasks.push('build:images');
	watchTasks.push('watch:images');
}

// --------------------------------------------------
// Gulp: Fonts
// --------------------------------------------------

if (fonts.enabled) {
	// Create a new build task
	gulp.task('build:fonts', function() {
		return pipeline(
			// Get the source files
			gulp.src(fonts.src),

			// Output
			gulp.dest(fonts.dest)
		);
	});

	// Create a new watch task
	gulp.task('watch:fonts', function() {
		return gulp.watch(fonts.src, gulp.series('build:fonts'));
	});

	// Add tasks to task lists
	buildTasks.push('build:fonts');
	watchTasks.push('watch:fonts');
}

// --------------------------------------------------
// Gulp: Exports
// --------------------------------------------------

// Prevent an error if all of the features are disabled
if (!buildTasks.length) buildTasks.push(done => done());
if (!watchTasks.length) watchTasks.push(done => done());

exports.clean = gulp.series(clean);

exports.build = gulp.series(buildTasks);

exports.watch = gulp.parallel(watchTasks);

exports.default = gulp.series(
	exports.clean, 
	exports.build, 
	exports.watch
);
