'use strict';

// --------------------------------------------------
// Global
// --------------------------------------------------

// General
const {src, dest, watch, series, parallel} = require('gulp');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const gulpif = require('gulp-if');
const del = require('del');
const {format} = require('string-kit');
const {pipeline} = require('readable-stream');

// CSS
const sass = require('gulp-sass');
const stylelint = require('gulp-stylelint');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

// JS
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const terser = require('gulp-terser');
const eslint = require('gulp-eslint');

// Images
const imagemin = require('gulp-imagemin');

// BrowserSync
const browserSync = require('browser-sync').create();

// Tasks will be added to this array
const tasks = [];

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
	lint: {
		enabled: true,
		input: './assets/sass/**/*.{scss,sass}'
	},
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
	lint: {
		enabled: true,
		input: './assets/js/**/*.js'
	},
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

/** @description A custom error handler to print prettier, more concise errors */
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

/** @description Assign the given name to a function object.
 *  @param {string} name The name given to the function.
 *  @param {function} func The function to name.
 */
const getNamedFunc = (name, func) => {
	Object.defineProperty(func, 'name', {value: name});
	return func;
};

/** @description Add a new, named function to the tasks array.
 *  @param {string} name The task (function) name.
 *  @param {function} func The task (function).
 */
const addTask = (name, func) => {
	return tasks.push(getNamedFunc(name, func));
};

/** @description Get tasks by name.
 *  @param {string} name The name used to search the tasks array.
 *  @returns {function|function[]} A function or an array of functions.
 */
const getTasks = (name) => {
	const taskList = tasks.filter((task) => task.name.startsWith(name));

	if (taskList.length == 0)
		return getNamedFunc(`${name}:disabled`, (done) => done());

	if (taskList.length == 1) return taskList[0];

	return taskList;
};

// --------------------------------------------------
// Clean Destination Folders
// --------------------------------------------------

if (styles.clean || scripts.clean || images.clean || copy.clean) {
	addTask('clean', (done) => {
		const toDelete = [];

		// Add output path from style.bundles
		if (styles.clean)
			styles.bundles.forEach((bundle) => toDelete.push(bundle.output));

		// Add output path from script.bundles
		if (scripts.clean)
			scripts.bundles.forEach((bundle) => toDelete.push(bundle.output));

		// Add output path from images
		if (images.clean) toDelete.push(images.output);

		// Add output path from copy.bundles
		if (copy.clean)
			copy.bundles.forEach((bundle) => toDelete.push(bundle.output));

		// Clean paths (unique paths only)
		del.sync([...new Set(toDelete)]);

		done();
	});
}

// --------------------------------------------------
// BrowserSync
// --------------------------------------------------

if (server.enabled) {
	addTask('serve', () => {
		browserSync.init(server.config);
		watch(server.watch).on('change', browserSync.reload);
	});
}

// --------------------------------------------------
// Compile Styles
// --------------------------------------------------

if (styles.enabled) {
	const processors = [];

	if (styles.prefix) processors.push(autoprefixer);
	if (styles.minify) processors.push(cssnano);

	styles.bundles.forEach((bundle) => {
		const buildName = `build:css:${bundle.name}`;
		const watchName = `watch:css:${bundle.name}`;

		addTask(buildName, (done) => {
			pipeline(
				// Get the input files
				src(bundle.input),

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
				dest(bundle.output),

				// Trigger browser reload
				gulpif(server.enabled, browserSync.stream())
			);
			done();
		});

		addTask(watchName, () => {
			watch(bundle.input, getTasks(buildName));
		});
	});
}

if (styles.lint.enabled) {
	addTask('lint:css', (done) => {
		pipeline(
			// Get the source files
			src(styles.lint.input),

			// lint JS
			stylelint({
				reporters: [{formatter: 'string', console: true}]
			})
		);
		done();
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
				src(bundle.input),

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
				dest(bundle.output),

				// Trigger browser reload
				gulpif(server.enabled, browserSync.stream())
			);
			done();
		});

		addTask(watchName, () => {
			watch(bundle.input, getTasks(buildName));
		});
	});
}

if (scripts.lint.enabled) {
	addTask('lint:js', (done) => {
		pipeline(
			// Get the source files
			src(scripts.lint.input),

			// lint JS
			eslint(),

			// Output problems
			eslint.format()
		);
		done();
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
			src(images.input),

			// Optimise PNG, JPG, GIF and SVG images
			imagemin(),

			// Output the images
			dest(images.output)
		);
		done();
	});

	addTask(watchName, () => {
		watch(images.input, getTasks(buildName));
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
				src(bundle.input),

				// Output the files
				dest(bundle.output)
			);
			done();
		});

		addTask(watchName, () => {
			watch(bundle.input, getTasks(buildName));
		});
	});
}

// --------------------------------------------------
// Exports
// --------------------------------------------------

// prettier-ignore
module.exports = {
	'clean': 		series(getTasks('clean')),
	'serve': 		series(getTasks('serve')),
	'build:css': 	series(getTasks('build:css')),
	'build:js': 	series(getTasks('build:js')),
	'build:copy': 	series(getTasks('build:copy')),
	'build:img': 	series(getTasks('build:img')),
	'build': 		series(getTasks('build')),
	'watch:css': 	parallel(getTasks('watch:css')),
	'watch:js': 	parallel(getTasks('watch:js')),
	'watch:copy': 	parallel(getTasks('watch:copy')),
	'watch:img': 	parallel(getTasks('watch:img')),
	'watch': 		parallel(getTasks('watch')),
	'lint:js': 		series(getTasks('lint:js')),
	'lint:css': 	series(getTasks('lint:css')),
	'lint': 		series(getTasks('lint')),
	'default': 		series(
						series(getTasks('clean')),
						series(getTasks('build')),
						parallel(getTasks('serve'), getTasks('watch'))
					)
};
