// --------------------------------------------------
// Config: Sass/SCSS
// --------------------------------------------------

module.exports.scss = {
	enabled: true,
	minify: true,
	prefix: true,
	sourcemaps: true,
	bundles: [
		{
			name: 'main',
			input: './assets/sass/styles.scss',
			output: './dist/css/'
		},
		{
			name: 'vendor',
			input: './assets/sass/vendor.scss',
			output: './dist/css/'
		}
	]
};

// --------------------------------------------------
// Config: JavaScript
// --------------------------------------------------

module.exports.js = {
	enabled: true,
	minify: true,
	sourcemaps: true,
	bundles: [
		{
			name: 'main',
			input: [
				'./assets/js/script-1.js',
				'./assets/js/script-2.js',
				'./assets/js/script-3.js'
			],
			output: './dist/js/'
		},
		{
			name: 'vendor',
			input: './node_modules/lodash/lodash.js',
			output: './dist/js/'
		}
	]
};

// --------------------------------------------------
// Config: Images
// --------------------------------------------------

module.exports.img = {
	enabled: true,
	input: './assets/images/**/*.{png,jpg,jpeg,gif,svg}',
	output: './dist/images/'
};

// --------------------------------------------------
// Config: Clean
// --------------------------------------------------

module.exports.clean = {
	enabled: true,
	input: './dist/*'
};

// --------------------------------------------------
// Config: Copy
// --------------------------------------------------

module.exports.copy = {
	enabled: true,
	bundles: [
		{
			name: 'fonts',
			input: './assets/fonts/**/*.{eot,woff2,woff,ttf,svg}',
			output: './dist/fonts/'
		}
	]
};

// --------------------------------------------------
// Config: Server
// --------------------------------------------------

module.exports.serve = {
	enabled: true,
	watch: ['./dist/**/*', './*.html'],
	config: {
		server: '.'
		//proxy: 'http://localhost/'
	}
};
