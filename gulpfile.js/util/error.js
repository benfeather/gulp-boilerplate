// --------------------------------------------------
// Imports
// --------------------------------------------------

const {format} = require('string-kit');

// --------------------------------------------------
// Error Handler
// --------------------------------------------------

/**
 * @description A custom error handler to print prettier, more concise errors
 */
module.exports.error = (err) => {
	const message =
		'\n' +
		`^rError:^ ${err.plugin} threw an error` +
		'\n' +
		`${err.messageOriginal}` +
		'\n' +
		`^rline ${err.line}^ in ^r${err.relativePath}^` +
		'\n';

	console.log(format(message));
};
