// --------------------------------------------------
// Imports
// --------------------------------------------------

import {js as config} from '../config';
import {src, watch} from 'gulp';
import {pipeline} from 'readable-stream';
import {rollup} from 'rollup';
import multi from '@rollup/plugin-multi-entry';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import {terser} from 'rollup-plugin-terser';
import eslint from 'gulp-eslint';

// --------------------------------------------------
// TaskFactory
// --------------------------------------------------

import TaskFactory from '../util/task-factory';
const Tasks = new TaskFactory();

// --------------------------------------------------
// Tasks
// --------------------------------------------------

if (config.enabled) {
	config.bundles.forEach((bundle) => {
		const buildName = `build: (js) - ${bundle.id}`;
		const watchName = `watch: (js) - ${bundle.id}`;
		const lintName = `lint: (js) - ${bundle.id}`;

		// Options
		const options = {...config.options, ...bundle.options};
		const plugins = [];

		plugins.push(multi());
		plugins.push(resolve());
		plugins.push(commonjs({sourceMap: false}));

		if (options.babel) {
			plugins.push(
				babel({
					babelrc: false,
					babelHelpers: 'bundled',
					exclude: ['**/node_modules/**', '**/vendor/**'],
					presets: [
						[
							'@babel/preset-env',
							{
								useBuiltIns: 'usage',
								corejs: {
									version: 3,
									proposals: false
								}
							}
						]
					],
					plugins: []
				})
			);
		}

		if (options.minify) {
			plugins.push(terser());
		}

		// Build
		Tasks.add(buildName, async () => {
			const code = await rollup({
				input: `${bundle.input.path}${bundle.input.file}.js`,
				plugins
			});

			await code.write({
				file: `${bundle.output.path}${bundle.output.file}.js`,
				format: 'cjs',
				sourcemap: options.sourcemaps
			});
		});

		// Watch
		Tasks.add(watchName, () => {
			watch(bundle.watch, Tasks.get(buildName));
		});

		// Lint
		Tasks.add(lintName, (done) => {
			pipeline(
				// Get the source files
				src(bundle.lint),

				// Lint JS
				eslint({
					fix: true,
					globals: ['jQuery', '$']
				}),

				// Output problems
				eslint.format()
			);
			done();
		});
	});
}

// --------------------------------------------------
// Export
// --------------------------------------------------

export default Tasks.get();
