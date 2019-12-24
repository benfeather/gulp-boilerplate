'use strict';

// --------------------------------------------------
// Global
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

// Task lists
const buildTasks = [];
const watchTasks = [];

// --------------------------------------------------
// Settings
// --------------------------------------------------

// Config: Styles
const styles = {
	enabled: true,
	clean: true,
	minify: true,
	prefix: true,
	sourcemaps: true,
	bundles: [
		{
			name: 'styles',
			input: './assets/sass/**/*.{scss,sass}',
			output: './dist/css/'
		}
	]
};

// Config: Scripts
const scripts = {
	enabled: true,
	clean: true,
	minify: true,
	sourcemaps: true,
	bundles: [
		{
			name: 'main',
			input: ['./assets/js/script-1.js', './assets/js/script-2.js'],
			output: './dist/js/'
		},
		{
			name: 'vendor',
			input: './assets/js/script-3.js',
			output: './dist/js/'
		}
	]
};

// Config: Images
const images = {
	enabled: true,
	clean: true,
	input: './assets/images/**/*.{png,jpg,jpeg,gif,svg}',
	output: './dist/images/'
};

// Config: Copy
const copy = {
	enabled: true,
	clean: true,
	bundles: [
		{
			name: 'fonts',
			input: './assets/fonts/**/*.{eot,woff2,woff,ttf,svg}',
			output: './dist/fonts/'
		}
	]
};

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

	// Add output path from style.bundles
	if (styles.enabled && styles.clean)
		styles.bundles.forEach(bundle => toDelete.push(bundle.output));

	// Add output path from script.bundles
	if (scripts.enabled && scripts.clean)
		scripts.bundles.forEach(bundle => toDelete.push(bundle.output));

	// Add output path from images
	if (images.enabled && images.clean) toDelete.push(images.output);

	// Add output path from copy.bundles
	if (copy.enabled && copy.clean)
		copy.bundles.forEach(bundle => toDelete.push(bundle.output));

	// Clean paths (unique paths only)
	del.sync([...new Set(toDelete)]);

	done();
};

// --------------------------------------------------
// Compile Styles
// --------------------------------------------------

if (styles.enabled) {
	// Create a new build task
	const cssBuildTask = function(bundle) {
		const processors = [];

		if (styles.prefix) processors.push(autoprefixer);
		if (styles.minify) processors.push(cssnano);

		gulp.task(bundle.buildName, function() {
			return pipeline(
				// Get the input files
				gulp.src(bundle.input),

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
					basename: bundle.name
				}),

				// Output the sourcemap
				gulpif(styles.sourcemaps, sourcemaps.write('.')),

				// Output the compiled css
				gulp.dest(bundle.output)
			);
		});
	};

	// Create a new watch task
	const cssWatchTask = function(bundle) {
		gulp.task(bundle.watchName, function() {
			return gulp.watch(bundle.input, gulp.series(bundle.buildName));
		});
	};

	// Create tasks for each bundle in styles
	styles.bundles.forEach(bundle => {
		bundle.buildName = 'build:css:' + bundle.name;
		bundle.watchName = 'watch:css:' + bundle.name;

		cssBuildTask(bundle);
		cssWatchTask(bundle);

		buildTasks.push(bundle.buildName);
		watchTasks.push(bundle.watchName);
	});
}

// --------------------------------------------------
// Compile Scripts
// --------------------------------------------------

if (scripts.enabled) {
	// Create a new build task
	const jsBuildTask = function(bundle) {
		gulp.task(bundle.buildName, function() {
			return pipeline(
				// Get the source files
				gulp.src(bundle.input),

				// Init the custom error handling
				plumber({
					errorHandler: error
				}),

				// Init the sourcemap
				gulpif(scripts.sourcemaps, sourcemaps.init()),

				// Combine the files and rename
				concat(bundle.name + '.js'),

				// Babel
				babel({
					presets: ['@babel/env']
				}),

				// Minify
				gulpif(scripts.minify, terser()),

				// Write the sourcemap
				gulpif(scripts.sourcemaps, sourcemaps.write('.')),

				// Output the compiled js
				gulp.dest(bundle.output)
			);
		});
	};

	// Create a new watch task
	const jsWatchTask = function(bundle) {
		gulp.task(bundle.watchName, function() {
			return gulp.watch(bundle.input, gulp.series(bundle.buildName));
		});
	};

	// Create tasks for each bundle in scripts
	scripts.bundles.forEach(bundle => {
		bundle.buildName = 'build:js:' + bundle.name;
		bundle.watchName = 'watch:js:' + bundle.name;

		jsBuildTask(bundle);
		jsWatchTask(bundle);

		buildTasks.push(bundle.buildName);
		watchTasks.push(bundle.watchName);
	});
}

// --------------------------------------------------
// Images
// --------------------------------------------------

if (images.enabled) {
	// Create a new build task
	gulp.task('build:images', function() {
		return pipeline(
			// Get the source files
			gulp.src(images.input),

			// Optimise PNG, JPEG, GIF and SVG images
			imagemin(),

			// Output the images
			gulp.dest(images.output)
		);
	});

	// Create a new watch task
	gulp.task('watch:images', function() {
		return gulp.watch(images.input, gulp.series('build:images'));
	});

	// Add tasks to task lists
	buildTasks.push('build:images');
	watchTasks.push('watch:images');
}

// --------------------------------------------------
// Copy
// --------------------------------------------------

if (copy.enabled) {
	// Create a new build task
	const copyBuildTask = function(bundle) {
		gulp.task(bundle.buildName, function() {
			return pipeline(
				// Get the source files
				gulp.src(bundle.input),

				// Output the files
				gulp.dest(bundle.output)
			);
		});
	};

	// Create a new watch task
	const copyWatchTask = function(bundle) {
		gulp.task(bundle.watchName, function() {
			return gulp.watch(bundle.input, gulp.series(bundle.buildName));
		});
	};

	// Create tasks for each bundle in copy.src
	copy.bundles.forEach(bundle => {
		bundle.buildName = 'build:copy:' + bundle.name;
		bundle.watchName = 'watch:copy:' + bundle.name;

		copyBuildTask(bundle);
		copyWatchTask(bundle);

		buildTasks.push(bundle.buildName);
		watchTasks.push(bundle.watchName);
	});
}

// --------------------------------------------------
// Exports
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
