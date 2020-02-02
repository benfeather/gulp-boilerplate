// --------------------------------------------------
// Require
// --------------------------------------------------

// Require: Config
const config = require('../config').configName;

// Require: Gulp
const {src, dest, watch} = require('gulp');
const pipeline = require('readable-stream').pipeline;
const plumber = require('gulp-plumber');
const gulpIf = require('gulp-if');

// Require: Plugins

// --------------------------------------------------
// TaskFactory
// --------------------------------------------------

const TaskFactory = require('../utilities/tasks');
const Tasks = new TaskFactory();

// --------------------------------------------------
// Tasks:
// --------------------------------------------------

if (config.enabled) {
	Tasks.add('build:', (done) => {
		pipeline(
			// Input
			src(config.input),

			// Init error handling
			plumber(),

			// --------------------------------------------------
			// ADD PLUGINS HERE
			// --------------------------------------------------

			// Output
			dest(config.output)
		);
		done();
	});

	Tasks.add('watch:', () => {
		watch(config.input, Tasks.get('build:'));
	});
}

// --------------------------------------------------
// Export Tasks
// --------------------------------------------------

module.exports = Tasks.get();
