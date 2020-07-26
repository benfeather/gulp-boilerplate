// --------------------------------------------------
// Imports
// --------------------------------------------------

import {serve as config} from '../config';
import {watch} from 'gulp';
import browserSync from 'browser-sync';

// --------------------------------------------------
// TaskFactory
// --------------------------------------------------

import TaskFactory from '../util/task-factory';
const Tasks = new TaskFactory();

// --------------------------------------------------
// Tasks
// --------------------------------------------------

if (config.enabled) {
	browserSync.create('localhost');

	Tasks.add('serve', () => {
		browserSync.init(config.options);
		watch(config.watch).on('change', browserSync.reload);
	});
}

// --------------------------------------------------
// Export
// --------------------------------------------------

export default Tasks.taskList;
