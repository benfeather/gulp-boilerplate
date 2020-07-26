// --------------------------------------------------
// Imports
// --------------------------------------------------

import {copy as config} from '../config';
import {src, dest, watch} from 'gulp';
import {pipeline} from 'readable-stream';
import plumber from 'gulp-plumber';

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
// Export
// --------------------------------------------------

module.exports = Tasks.get();
