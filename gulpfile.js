'use strict';

// --------------------------------------------------
// Require
// --------------------------------------------------

// General
const gulp = require('gulp');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
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

// --------------------------------------------------
// Settings & Configuration
// --------------------------------------------------

const styles = {
	dest: 'dist/css/',
	bundles: {
		styles: 'src/sass/**/*.{scss,sass}'
	}
};

const scripts = {
	dest: 'dist/js/',
	bundles: {
		main: ['src/js/script-1.js', 'src/js/script-2.js'],
		vendor: ['src/js/script-3.js']
	}
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

const clean = function (done) {
    del.sync([
        styles.dest, 
        scripts.dest
    ]);

    done();
};

// --------------------------------------------------
// Gulp: Compile Styles
// --------------------------------------------------

const cssBuildTask = function(task) {
	gulp.task(task.buildName, function() {
		return pipeline(
			// Get the source files
			gulp.src(task.files),

			// Init the custom error handling
			plumber({
				errorHandler: error
			}),

			// Init the sourcemap
			sourcemaps.init(),

			// Compile sass
			sass(),

			// Apply the PostCSS processors
			postcss([autoprefixer, cssnano]),

			// Rename the file with the 'min' suffix
			rename({
				basename: task.name,
				suffix: '.min'
			}),

			// Output the sourcemap
			sourcemaps.write('.'),

			// Output the compiled css
			gulp.dest(styles.dest)
		);
	});
};

const cssWatchTask = function(task) {
	gulp.task(task.watchName, function() {
		return gulp.watch(task.files, gulp.series(task.buildName));
	});
};

// Create tasks for each bundle in styles.bundles
for (const [name, files] of Object.entries(styles.bundles)) {
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

// --------------------------------------------------
// Gulp: Compile Scripts
// --------------------------------------------------

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
			sourcemaps.init(),

			// Combine the files and rename
			concat(task.name + '.min.js'),

			// Babel
			babel({
				presets: ['@babel/env']
			}),

			// Minify
			terser(),

			// Write the sourcemap
			sourcemaps.write('.'),

			// Output the compiled js
			gulp.dest(scripts.dest)
		);
	});
};

const jsWatchTask = function(task) {
	gulp.task(task.watchName, function() {
		return gulp.watch(task.files, gulp.series(task.buildName));
	});
};

// Create tasks for each bundle in scripts.bundles
for (const [name, files] of Object.entries(scripts.bundles)) {
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

// --------------------------------------------------
// Gulp: Exports
// --------------------------------------------------

exports.clean = gulp.series(
	clean
);

exports.build = gulp.series(
	gulp.parallel(buildTasks)
);

exports.watch = gulp.series(
	gulp.parallel(watchTasks)
);

exports.default = gulp.series(
    clean,
	gulp.parallel(buildTasks),
	gulp.parallel(watchTasks)
);