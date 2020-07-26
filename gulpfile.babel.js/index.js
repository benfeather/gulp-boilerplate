// --------------------------------------------------
// Imports
// --------------------------------------------------

import {series, parallel} from 'gulp';
import serve from './tasks/serve';
import clean from './tasks/clean';
import scss from './tasks/scss';
import js from './tasks/javascript';
import copy from './tasks/copy';
import img from './tasks/images';

// --------------------------------------------------
// TaskFactory
// --------------------------------------------------

import TaskFactory from './util/task-factory';
const Tasks = new TaskFactory([
	...serve,
	...clean,
	...scss,
	...js,
	...copy,
	...img
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
						series(Tasks.get('build')),
						parallel(Tasks.get('serve'), Tasks.get('watch'))
					)
};
