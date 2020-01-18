# Gulp Boilerplate

A boilerplate for building web projects with [Gulp](https://gulpjs.com/). This project is based on Gulp 4.x.

**Features**

- Create CSS and JS bundles without having to manually create separate tasks.
- Easily turn features on/off using the config objects. 
- Compile (babel), concatenate, minify, and lint JavaScript.
- Compile, minify, autoprefix, and lint Sass/SCSS.
- Optimize Images (PNG, JPG, GIF and SVG).
- Copy static files and folders into your `dist` directory.
- Watch for file changes, automatically recompile your code and reload your browser

## Getting Started

### Dependencies

*__Note:__ if you've previously installed Gulp globally, run `npm rm --global gulp` to remove it. [Details here.](https://medium.com/gulpjs/gulp-sips-command-line-interface-e53411d4467)*

Make sure these are installed first.

- [Node.js](http://nodejs.org)
- [Gulp Command Line Utility](http://gulpjs.com) `npm install --global gulp-cli`

### Quick Start

1. Open a terminal in your project directory.
2. Run `npm install` to install required files and dependencies.
3. When it's done installing, run one of the task runners to get going:
	- `gulp` will run all of the enabled tasks (Clean, Build and Watch).
	- `gulp watch` will watch files for changes and automatically compile your code. 
	- `gulp --tasks` will list all of the available tasks. 

## Options & Settings

This Gulp Boilerplate makes it easy to customize the tool for projects without having to delete or modify tasks.

### Configuration Objects

Each task has an associated configuration object located at the top of `gulpfile.js`. A basic configuration object will look something like this:

```js
const configName = {
	enabled: true,
	clean: true,
	sourcemaps: true,
	bundles: []
};
```

Using the settings you can:
  - Enable/disable all of the related tasks
  - Enable/disble directory "cleaning"
  - Enable/disable source maps
  - Create new code bundles

### Bundles

You can create separate files ("bundles") by simply adding objects to the bundles array in the task config.

```js
const styles = {
	enabled: true,
	...
	bundles: [
		{
			name: 'bundle',
			input: './assets/sass/**/*.{scss,sass}',
			output: './dist/css/'
		}
	]
};
```

The config above will create a new CSS bundle called `bundle.css` in the `dist/css` folder consisting of the compiled sass from all of the files in the `assets/sass` folder.
