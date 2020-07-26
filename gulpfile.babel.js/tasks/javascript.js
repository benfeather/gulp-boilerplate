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
		const buildName = `build: (js) - ${bundle.name}`;
		const watchName = `watch: (js) - ${bundle.name}`;
		const lintName = `lint: (js) - ${bundle.name}`;

		// Options
		const options = {...config.options, ...bundle.options};
		const plugins = [];

		plugins.push(multi());
		plugins.push(resolve());
		plugins.push(commonjs());

		if (options.babel) {
			plugins.push(
				babel({
					babelrc: false,
					babelHelpers: 'bundled',
					exclude: ['**/node_modules/**'],
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
				input: bundle.input,
				plugins: plugins
			});

			await code.write({
				file: `${bundle.output}${bundle.name}.js`,
				format: 'es',
				sourcemap: options.sourcemaps
			});
		});

		// Watch
		Tasks.add(watchName, () => {
			watch(bundle.input, Tasks.get(buildName));
		});

		// Lint
		Tasks.add(lintName, (done) => {
			pipeline(
				// Get the source files
				src(bundle.input),

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

module.exports = Tasks.get();
