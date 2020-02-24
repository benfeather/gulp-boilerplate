// --------------------------------------------------
// Require
// --------------------------------------------------

// Require: Config
const config = require('../config').js;

// Require: Gulp
const {src, dest, watch} = require('gulp');
const pipeline = require('readable-stream').pipeline;
const plumber = require('gulp-plumber');
const gulpIf = require('gulp-if');

// Require: Plugins
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').get('localhost');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const terser = require('gulp-terser');
const eslint = require('gulp-eslint');

// --------------------------------------------------
// TaskFactory
// --------------------------------------------------

const TaskFactory = require('../util/task-factory');
const Tasks = new TaskFactory();

// --------------------------------------------------
// Tasks: Scripts
// --------------------------------------------------

if (config.enabled) {
	config.bundles.forEach((bundle) => {
		const buildName = `build: (js) - ${bundle.name}`;
		const watchName = `watch: (js) - ${bundle.name}`;
		const lintName = `lint: (js) - ${bundle.name}`;

		Tasks.add(buildName, (done) => {
			pipeline(
				// Input
				src(bundle.input),

				// Init error handling
				plumber(),

				// Init the source map
				gulpIf(config.sourcemaps, sourcemaps.init()),

				// Babel
				babel({
					presets: ['@babel/env'],
					ignore: ['node_modules']
				}),

				// Combine the files and rename
				concat(bundle.name + '.js'),

				// Minify
				gulpIf(config.minify, terser()),

				// Output the source map
				gulpIf(config.sourcemaps, sourcemaps.write('.')),

				// Output
				dest(bundle.output),

				// Stream changes to server
				browserSync.stream()
			);
			done();
		});

		Tasks.add(watchName, () => {
			watch(bundle.input, Tasks.get(buildName));
		});

		Tasks.add(lintName, (done) => {
			pipeline(
				// Get the source files
				src(bundle.input),

				// Lint JS
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
}

// --------------------------------------------------
// Export Tasks
// --------------------------------------------------

module.exports = Tasks.get();
