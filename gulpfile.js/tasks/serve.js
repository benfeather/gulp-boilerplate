// --------------------------------------------------
// Require
// --------------------------------------------------

// Require: Config
const config = require('../config').serve;

// Require: Gulp
const {watch} = require('gulp');

// Require: Plugins
const browserSync = require('browser-sync');

// --------------------------------------------------
// TaskFactory
// --------------------------------------------------

const TaskFactory = require('../utilities/tasks');
const Tasks = new TaskFactory();

// --------------------------------------------------
// BrowserSync
// --------------------------------------------------

if (config.enabled) {
	Tasks.add('serve', () => {
		browserSync.create();
		browserSync.init(config.config);
		watch(config.watch).on('change', browserSync.reload);
	});
}

// --------------------------------------------------
// Export
// --------------------------------------------------

module.exports = Tasks.taskList;
