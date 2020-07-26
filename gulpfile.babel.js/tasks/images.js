// --------------------------------------------------
// Imports
// --------------------------------------------------

import {images as config} from '../config';
import {src, dest, watch} from 'gulp';
import {pipeline} from 'readable-stream';
import plumber from 'gulp-plumber';
import imagemin from 'gulp-imagemin';
import cache from 'gulp-cache';

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
		const buildName = `build: (img) - ${bundle.name}`;
		const watchName = `watch: (img) - ${bundle.name}`;

		// Options
		const options = {...config.options, ...bundle.options};

		// Build
		Tasks.add(buildName, (done) => {
			pipeline(
				// Input
				src(bundle.input),

				// Init error handling
				plumber(),

				// Optimise PNG, JPG, GIF and SVG images
				cache(
					imagemin({
						silent: options.silent
					})
				),

				// Output
				dest(bundle.output)
			);
			done();
		});

		// Watch
		Tasks.add(watchName, () => {
			watch(bundle.input, Tasks.get(buildName));
		});
	});
}

// --------------------------------------------------
// Export
// --------------------------------------------------

export default Tasks.get();
