'use strict';

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
			input: [
				'./assets/js/script-1.js',
				'./assets/js/script-2.js',
				'./assets/js/script-3.js'
			],
			output: './dist/js/'
		},
		{
			name: 'vendor',
			input: './node_modules/lodash/lodash.js',
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
	watch: './*.html',
	config: {
		server: '.'
		//proxy: 'http://localhost/'
	}
};

// --------------------------------------------------
// Global
// --------------------------------------------------

// General
const {src, dest, watch, series, parallel} = require('gulp');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const gulpIf = require('gulp-if');
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
// BrowserSync
// --------------------------------------------------

if (server.enabled) {
	addTask('serve', () => {
		browserSync.init(server.config);
		watch(server.watch).on('change', browserSync.reload);
	});
}

// --------------------------------------------------
// Styles
// --------------------------------------------------

if (styles.enabled) {
	const processors = [];

	if (styles.prefix) processors.push(autoprefixer);
	if (styles.minify) processors.push(cssnano);

	styles.bundles.forEach((bundle) => {
		const buildName = `build:css:${bundle.name}`;
		const watchName = `watch:css:${bundle.name}`;
		const lintName = `lint:css:${bundle.name}`;

		addTask(buildName, (done) => {
			pipeline(
				// Get the input files
				src(bundle.input),

				// Init the custom error handling
				plumber({
					errorHandler: error
				}),

				// Init the source map
				gulpIf(styles.sourcemaps, sourcemaps.init()),

				// Compile sass
				sass(),

				// Apply the PostCSS processors
				gulpIf(processors.length, postcss(processors)),

				// Rename the output file
				rename({
					basename: bundle.name
				}),

				// Output the source map
				gulpIf(styles.sourcemaps, sourcemaps.write('.')),

				// Output the compiled css
				dest(bundle.output),

				// Trigger browser reload
				gulpIf(server.enabled, browserSync.stream())
			);
			done();
		});

		addTask(watchName, () => {
			watch(bundle.input, getTasks(buildName));
		});

		addTask(lintName, (done) => {
			pipeline(
				// Get the source files
				src(bundle.input),

				// Lint CSS
				stylelint({
					fix: true,
					reporters: [{formatter: 'string', console: true}]
				})
			);
			done();
		});
	});

	if (styles.clean) {
		addTask('clean:css', (done) => {
			const toDelete = [];

			styles.bundles.forEach((bundle) => toDelete.push(bundle.output));

			del.sync([...new Set(toDelete)]); // Clean unique paths only

			done();
		});
	}
}

// --------------------------------------------------
// Scripts
// --------------------------------------------------

if (scripts.enabled) {
	scripts.bundles.forEach((bundle) => {
		const buildName = `build:js:${bundle.name}`;
		const watchName = `watch:js:${bundle.name}`;
		const lintName = `lint:js:${bundle.name}`;

		addTask(buildName, (done) => {
			pipeline(
				// Get the source files
				src(bundle.input),

				// Init the custom error handling
				plumber({
					errorHandler: error
				}),

				// Init the source map
				gulpIf(scripts.sourcemaps, sourcemaps.init()),

				// Babel
				babel({
					presets: ['@babel/env'],
					ignore: ['node_modules']
				}),

				// Combine the files and rename
				concat(bundle.name + '.js'),

				// Minify
				gulpIf(scripts.minify, terser()),

				// Write the source map
				gulpIf(scripts.sourcemaps, sourcemaps.write('.')),

				// Output the compiled js
				dest(bundle.output),

				// Trigger browser reload
				gulpIf(server.enabled, browserSync.stream())
			);
			done();
		});

		addTask(watchName, () => {
			watch(bundle.input, getTasks(buildName));
		});

		addTask(lintName, (done) => {
			pipeline(
				// Get the source files
				src(bundle.input),

				// lint JS
				eslint({
					fix: true,
					globals: ['jQuery', '$']
				}),

				// Output problems
				eslint.format()
			);
			done();
		});
	});

	if (scripts.clean) {
		addTask('clean:js', (done) => {
			const toDelete = [];

			scripts.bundles.forEach((bundle) => toDelete.push(bundle.output));

			del.sync([...new Set(toDelete)]); // Clean unique paths only

			done();
		});
	}
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
			imagemin({
				silent: true
			}),

			// Output the images
			dest(images.output)
		);
		done();
	});

	addTask(watchName, () => {
		watch(images.input, getTasks(buildName));
	});

	if (images.clean) {
		addTask('clean:img', (done) => {
			del.sync(images.output);
			done();
		});
	}
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

	if (copy.clean) {
		addTask('clean:copy', (done) => {
			const toDelete = [];

			copy.bundles.forEach((bundle) => toDelete.push(bundle.output));

			del.sync([...new Set(toDelete)]); // Clean unique paths only

			done();
		});
	}
}

// --------------------------------------------------
// Exports
// --------------------------------------------------

// prettier-ignore
module.exports = {
    'watch': 		parallel(getTasks('watch')),
	'serve': 		parallel(getTasks('serve'), getTasks('watch')),
	'clean': 		series(getTasks('clean')),
	'build': 		series(getTasks('build')),
	'lint': 		series(getTasks('lint')),
	'default': 		series(
						series(getTasks('clean')),
						series(getTasks('build')),
						parallel(getTasks('serve'), getTasks('watch'))
					)
};
