// --------------------------------------------------
// Config: Serve
// --------------------------------------------------

export const serve = {
	enabled: true,
	watch: ['./dist/**/*', './*.html'],
	options: {
		open: false,
		server: '.'
		//proxy: 'http://localhost/'
	}
};

// --------------------------------------------------
// Config: Clean
// --------------------------------------------------

export const clean = {
	enabled: true,
	input: './dist/*'
};

// --------------------------------------------------
// Config: SCSS
// --------------------------------------------------

export const scss = {
	enabled: true,
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
	],
	options: {
		prefix: true,
		minify: true,
		sourcemaps: true
	}
};

// --------------------------------------------------
// Config: JS
// --------------------------------------------------

export const js = {
	enabled: true,
	bundles: [
		{
			name: 'main',
			input: './assets/js/app.js',
			output: './dist/js/'
		}
	],
	options: {
		babel: true,
		minify: false,
		sourcemaps: true
	}
};

// --------------------------------------------------
// Config: Copy
// --------------------------------------------------

export const copy = {
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
// Config: Images
// --------------------------------------------------

export const images = {
	enabled: true,
	bundles: [
		{
			name: 'images',
			input: './assets/images/**/*.{png,jpg,jpeg,gif,svg}',
			output: './dist/images/'
		}
	],
	options: {
		silent: true
	}
};
