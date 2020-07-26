// --------------------------------------------------
// Imports
// --------------------------------------------------

import {clean as config} from '../config';
import del from 'del';

// --------------------------------------------------
// TaskFactory
// --------------------------------------------------

import TaskFactory from '../util/task-factory';
const Tasks = new TaskFactory();

// --------------------------------------------------
// Tasks:
// --------------------------------------------------

if (config.enabled) {
	Tasks.add('clean', (done) => {
		// Delete all files and folders
		del.sync(config.input);
		done();
	});
}

// --------------------------------------------------
// Export
// --------------------------------------------------

module.exports = Tasks.get();
