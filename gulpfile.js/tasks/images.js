// --------------------------------------------------
// Require
// --------------------------------------------------

// Require: Config
const config = require('../config').img;

// Require: Gulp
const {src, dest, watch} = require('gulp');
const pipeline = require('readable-stream').pipeline;
const plumber = require('gulp-plumber');

// Require: Plugins
const imagemin = require('gulp-imagemin');

// --------------------------------------------------
// TaskFactory
// --------------------------------------------------

const TaskFactory = require('../util/task-factory');
const Tasks = new TaskFactory();

// --------------------------------------------------
// Tasks: Images
// --------------------------------------------------

if (config.enabled) {
	const buildName = `build: (img)`;
	const watchName = `watch: (img)`;

	Tasks.add(buildName, (done) => {
		pipeline(
			// Input
			src(config.input),

			// Init error handling
			plumber(),

			// Optimise PNG, JPG, GIF and SVG images
			imagemin({
				silent: true
			}),

			// Output
			dest(config.output)
		);
		done();
	});

	Tasks.add(watchName, () => {
		watch(config.input, Tasks.get(buildName));
	});
}

// --------------------------------------------------
// Export Tasks
// --------------------------------------------------

module.exports = Tasks.get();
