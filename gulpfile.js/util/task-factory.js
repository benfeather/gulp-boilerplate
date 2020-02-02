// --------------------------------------------------
// TaskFactory
// --------------------------------------------------

class TaskFactory {
	constructor(tasks = []) {
		this.taskList = tasks;
	}

	/** @description Assign the given name to a function object.
	 *  @param {string} name The name given to the function.
	 *  @param {function} func The function to name.
	 */
	nameFunc = (name, func) => {
		Object.defineProperty(func, 'name', {value: name});
		return func;
	};

	/** @description Add a new, named function to the taskList array.
	 *  @param {string} name The task (function) name.
	 *  @param {function} func The task (function).
	 */
	add = (name, func) => {
		this.taskList.push(this.nameFunc(name, func));
	};

	/** @description Get tasks by name.
	 *  @param {string} name The name used to search the taskList array.
	 *  @returns {function|function[]} A function or an array of functions.
	 */
	get = (name) => {
		if (!name) return this.taskList;

		const tasks = this.taskList.filter((task) =>
			task.name.startsWith(name)
		);

		if (tasks.length == 0)
			return this.nameFunc(`${name}: (disabled)`, (done) => done());

		if (tasks.length == 1) return tasks[0];

		return tasks;
	};
}

// --------------------------------------------------
// Exports
// --------------------------------------------------

module.exports = TaskFactory;
