// --------------------------------------------------
// Require
// --------------------------------------------------

// Require: Config
const config = require('../config').copy;

// Require: Gulp
const {src, dest, watch} = require('gulp');
const pipeline = require('readable-stream').pipeline;
const plumber = require('gulp-plumber');

// --------------------------------------------------
// TaskFactory
// --------------------------------------------------

const TaskFactory = require('../util/task-factory');
const Tasks = new TaskFactory();

// --------------------------------------------------
// Tasks: Copy
// --------------------------------------------------

if (config.enabled) {
	config.bundles.forEach((bundle) => {
		const buildName = `build: (copy) - ${bundle.name}`;
		const watchName = `watch: (copy) - ${bundle.name}`;

		Tasks.add(buildName, (done) => {
			pipeline(
				// Input
				src(bundle.input),

				// Init error handling
				plumber(),

				// Output
				dest(bundle.output)
			);
			done();
		});

		Tasks.add(watchName, () => {
			watch(bundle.input, Tasks.get(buildName));
		});
	});
}

// --------------------------------------------------
// Export Tasks
// --------------------------------------------------

module.exports = Tasks.get();
