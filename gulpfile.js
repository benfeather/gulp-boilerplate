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
const combinemq = require('postcss-combine-media-query');

// JS
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const terser = require('gulp-terser');

// Images
const imagemin = require('gulp-imagemin');

// BrowserSync
const browserSync = require('browser-sync').create();

// Tasks list
const tasks = {};

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
			name: 'main',
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

// Config: Server with LiveReload
const server = {
	enabled: true,
	watch: './index.html',
	config: {
		server: '.'
		//proxy: "http://localhost/"
	}
};

// --------------------------------------------------
// Helpers
// --------------------------------------------------

// Custom error handler
const error = (err) => {
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

// Add a new, named function to tasks[]
const addTask = (name, func) => {
	tasks[name] = getNamedFunc(name, func);
};

// Give the defined name to a function object
// The name is used for Gulp cli output
const getNamedFunc = (name, func) => {
	Object.defineProperty(func, 'name', { value: name });
	return func;
};

// Get tasks by name as []
const getTasks = (name) => {
	const taskList = [];

	Object.keys(tasks).forEach(task => {
		if (task.includes(name)) taskList.push(tasks[task]);
	});

	if (!taskList.length)
		taskList.push(getNamedFunc(`${name}:disabled`, done => done()));

	return taskList;
};

// Get tasks by name as gulp.series
const getSeries = (name) => {
	return gulp.series(getTasks(name));
};

// Get tasks by name as gulp.parallel
const getParallel = (name) => {
	return gulp.parallel(getTasks(name));
};

// --------------------------------------------------
// Clean Destination Folders
// --------------------------------------------------

const clean = (done) => {
	const toDelete = [];

	// Add output path from style.bundles
	if (styles.clean)
		styles.bundles.forEach(bundle => toDelete.push(bundle.output));

	// Add output path from script.bundles
	if (scripts.clean)
		scripts.bundles.forEach(bundle => toDelete.push(bundle.output));

	// Add output path from images
	if (images.clean) 
		toDelete.push(images.output);

	// Add output path from copy.bundles
	if (copy.clean)
		copy.bundles.forEach(bundle => toDelete.push(bundle.output));

	// Clean paths (unique paths only)
	del.sync([...new Set(toDelete)]);

	done();
};

// --------------------------------------------------
// BrowserSync
// --------------------------------------------------

const serve = (done) => {
	if (!server.enabled) return done();

	browserSync.init(server.config);

	gulp.watch(server.watch).on('change', browserSync.reload);
};

// --------------------------------------------------
// Compile Styles
// --------------------------------------------------

if (styles.enabled) {
	const processors = [
		combinemq
	];

	if (styles.prefix) processors.push(autoprefixer);
	if (styles.minify) processors.push(cssnano);

	styles.bundles.forEach((bundle) => {
		const buildName = `build:css:${bundle.name}`;
		const watchName = `watch:css:${bundle.name}`;

		addTask(buildName, (done) => {
			pipeline(
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
				gulpif(processors.length, postcss(processors)),

				// Rename the output file
				rename({
					basename: bundle.name
				}),

				// Output the sourcemap
				gulpif(styles.sourcemaps, sourcemaps.write('.')),

				// Output the compiled css
				gulp.dest(bundle.output),

				// Trigger browser reload
				gulpif(server.enabled, browserSync.stream())
			);
			done();
		});

		addTask(watchName, () => {
			gulp.watch(bundle.input, tasks[buildName]);
		});
	});
}

// --------------------------------------------------
// Compile Scripts
// --------------------------------------------------

if (scripts.enabled) {
	scripts.bundles.forEach((bundle) => {
		const buildName = `build:js:${bundle.name}`;
		const watchName = `watch:js:${bundle.name}`;

		addTask(buildName, (done) => {
			pipeline(
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
				gulp.dest(bundle.output),

				// Trigger browser reload
				gulpif(server.enabled, browserSync.stream())
			);
			done();
		});

		addTask(watchName, () => {
			gulp.watch(bundle.input, tasks[buildName]);
		});
	});
}

// --------------------------------------------------
// Images
// --------------------------------------------------

if (images.enabled) {
	const buildName = `build:img`;
	const watchName = `watch:img`;

	addTask(buildName, (done) => {
		pipeline(
			// Get the source files
			gulp.src(images.input),

			// Optimise PNG, JPG, GIF and SVG images
			imagemin(),

			// Output the images
			gulp.dest(images.output)
		);
		done();
	});

	addTask(watchName, () => {
		gulp.watch(images.input, tasks[buildName]);
	});
}

// --------------------------------------------------
// Copy
// --------------------------------------------------

if (copy.enabled) {
	copy.bundles.forEach((bundle) => {
		const buildName = `build:copy:${bundle.name}`;
		const watchName = `watch:copy:${bundle.name}`;

		addTask(buildName, (done) => {
			pipeline(
				// Get the source files
				gulp.src(bundle.input),

				// Output the files
				gulp.dest(bundle.output)
			);
			done();
		});

		addTask(watchName, () => {
			gulp.watch(bundle.input, tasks[buildName]);
		});
	});
}

// --------------------------------------------------
// Exports
// --------------------------------------------------

// console.log(tasks) // View generated tasks

module.exports = {
	'clean': 		clean,
	'serve': 		gulp.parallel(serve, getTasks('watch')),
	'build:css': 	getSeries('build:css'),
	'build:js': 	getSeries('build:js'),
	'build:copy': 	getSeries('build:copy'),
	'build:img': 	getSeries('build:img'),
	'build': 		getSeries('build'),
	'watch:css': 	getParallel('watch:css'),
	'watch:js': 	getParallel('watch:js'),
	'watch:copy': 	getParallel('watch:copy'),
	'watch:img': 	getParallel('watch:img'),
	'watch': 		getParallel('watch')
};

module.exports.default = gulp.series(
	clean,
	getSeries('build'),
	gulp.parallel(serve, getTasks('watch'))
);
