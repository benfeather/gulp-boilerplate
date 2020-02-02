// --------------------------------------------------
// Require
// --------------------------------------------------

// Require: Config
const config = require('../config').styles;

// Require: Gulp
const {src, dest, watch} = require('gulp');
const pipeline = require('readable-stream').pipeline;
const plumber = require('gulp-plumber');
const gulpIf = require('gulp-if');

// Require: Plugins
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const stylelint = require('gulp-stylelint');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const error = require('../util/error');

// --------------------------------------------------
// TaskFactory
// --------------------------------------------------

const TaskFactory = require('../util/task-factory');
const Tasks = new TaskFactory();

// --------------------------------------------------
// Tasks: Styles
// --------------------------------------------------

if (config.enabled) {
	const processors = [];

	if (config.prefix) processors.push(autoprefixer);
	if (config.minify) processors.push(cssnano);

	config.bundles.forEach((bundle) => {
		const buildName = `build: (scss) - ${bundle.name}`;
		const watchName = `watch: (scss) - ${bundle.name}`;
		const lintName = `lint: (scss) - ${bundle.name}`;

		Tasks.add(buildName, (done) => {
			pipeline(
				// Input
				src(bundle.input),

				// Init error handling
				plumber({errorHandler: error}),

				// Init the source map
				gulpIf(config.sourcemaps, sourcemaps.init()),

				// Compile sass
				sass(),

				// Apply the PostCSS processors
				gulpIf(processors.length, postcss(processors)),

				// Rename the output file
				rename({
					basename: bundle.name
				}),

				// Output the source map
				gulpIf(config.sourcemaps, sourcemaps.write('.')),

				// Output
				dest(bundle.output)
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
// Export Tasks
// --------------------------------------------------

module.exports = Tasks.get();
