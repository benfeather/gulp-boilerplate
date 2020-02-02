// --------------------------------------------------
// Require
// --------------------------------------------------

// Require: Config
const config = require('../config').clean;

// Require: Plugins
const del = require('del');

// --------------------------------------------------
// TaskFactory
// --------------------------------------------------

const TaskFactory = require('../utilities/tasks');
const Tasks = new TaskFactory();

// --------------------------------------------------
// Tasks:
// --------------------------------------------------

if (config.enabled) {
	Tasks.add('clean', (done) => {
		// Delete all filed/folders
		del.sync(config.input);

		done();
	});
}

// --------------------------------------------------
// Export Tasks
// --------------------------------------------------

module.exports = Tasks.get();
