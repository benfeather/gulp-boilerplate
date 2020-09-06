// --------------------------------------------------
// Imports
// --------------------------------------------------

import {scss as config} from '../config';
import {src, dest, watch} from 'gulp';
import {pipeline} from 'readable-stream';
import plumber from 'gulp-plumber';
import gulpIf from 'gulp-if';
import sourcemaps from 'gulp-sourcemaps';
import rename from 'gulp-rename';
import sass from 'gulp-sass';
import stylelint from 'gulp-stylelint';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import ns from 'node-sass';

sass.compiler = ns; // explicitly set the compiler to node-sass

// --------------------------------------------------
// TaskFactory
// --------------------------------------------------

import TaskFactory from '../util/task-factory';
const Tasks = new TaskFactory();

// --------------------------------------------------
// Tasks
// --------------------------------------------------

if (config.enabled) {
	config.bundles.forEach((bundle) => {
		const buildName = `build: (scss) - ${bundle.id}`;
		const watchName = `watch: (scss) - ${bundle.id}`;
		const lintName = `lint: (scss) - ${bundle.id}`;

		// Options
		const options = {...config.options, ...bundle.options};
		const plugins = [];

		if (options.prefix) plugins.push(autoprefixer);
		if (options.minify) plugins.push(cssnano);

		// Build
		Tasks.add(buildName, (done) => {
			pipeline(
				// Input
				src(`${bundle.input.path}${bundle.input.file}.{css,sass,scss}`),

				// Init error handling
				plumber(),

				// Init the source map
				gulpIf(options.sourcemaps, sourcemaps.init()),

				// Compile sass
				sass().on('error', sass.logError),

				// Apply the PostCSS processors, if any
				gulpIf(plugins.length, postcss(plugins)),

				// Output the source map
				gulpIf(options.sourcemaps, sourcemaps.write('.')),

				// Rename the output file
				rename({
					basename: bundle.output.file
				}),

				// Output
				dest(bundle.output.path)
			);
			done();
		});

		// Watch
		Tasks.add(watchName, () => {
			watch(bundle.watch, Tasks.get(buildName));
		});

		// Lint
		Tasks.add(lintName, (done) => {
			pipeline(
				// Get the source files
				src(bundle.lint),

				// Lint CSS
				stylelint({
					fix: true,
					reporters: [{formatter: 'string', console: true}]
				})
			);
			done();
		});
	});
}

// --------------------------------------------------
// Export
// --------------------------------------------------

export default Tasks.get();
