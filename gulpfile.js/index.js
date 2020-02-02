// --------------------------------------------------
// Require
// --------------------------------------------------

// Require: Gulp
const {series, parallel} = require('gulp');

// Require: Tasks
const clean = require('./tasks/clean');
const css = require('./tasks/styles');
const js = require('./tasks/scripts');
const copy = require('./tasks/copy');
const img = require('./tasks/images');
const serve = require('./tasks/serve');

// --------------------------------------------------
// TaskFactory
// --------------------------------------------------

const TaskFactory = require('./utilities/tasks');
const Tasks = new TaskFactory([
	...clean,
	...css,
	...js,
	...copy,
	...img,
	...serve
]);

// --------------------------------------------------
// Exports
// --------------------------------------------------

// prettier-ignore
module.exports = {
    'watch': 		parallel(Tasks.get('watch')),
	'serve': 		parallel(Tasks.get('watch'), Tasks.get('serve')),
	'clean': 		series(Tasks.get('clean')),
	'build': 		series(Tasks.get('build')),
	'lint': 		series(Tasks.get('lint')),
	'default': 		series(
						series(Tasks.get('clean')),
						series(Tasks.get('build')),
						parallel(Tasks.get('serve'), Tasks.get('watch'))
					)
};
