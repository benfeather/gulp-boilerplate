const promiseFunc = () => {
	return new Promise((resolve, reject) => {
		let counter = 0;

		let int = setInterval(() => {
			console.log(counter);

			if (counter >= 5) {
				clearInterval(int);
				resolve();
			}

			counter++;
		}, 1000);
	});
};

export default promiseFunc;
