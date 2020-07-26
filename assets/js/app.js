import module from './modules/module';
import unused from './modules/unused';
import promiseFunc from './modules/promise';

const init = async () => {
	await promiseFunc();

	console.log('I am done counting... Have some names instead:');

	const names = ['Bob', 'Ben', 'John'];

	names.forEach((name) => console.log(name));
};

module();
init();
