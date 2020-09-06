// --------------------------------------------------
// Imports
// --------------------------------------------------

import {clean as config} from '../config';
import fs from 'fs';

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
		fs.rmdirSync(config.input, {recursive: true});
		done();
	});
}

// --------------------------------------------------
// Export
// --------------------------------------------------

export default Tasks.get();
