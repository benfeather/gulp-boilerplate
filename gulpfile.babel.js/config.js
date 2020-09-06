// --------------------------------------------------
// Misc
// --------------------------------------------------

const isProduction = false;

// --------------------------------------------------
// Config: Serve
// --------------------------------------------------

export const serve = {
	enabled: true,
	watch: ['./dist/**/*'],
	options: {
		open: false,
		server: './dist/'
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
			id: 'main',
			input: {
				path: './assets/sass/',
				file: 'styles'
			},
			output: {
				path: './dist/css/',
				file: 'main'
			},
			watch: './assets/sass/**/*.{css,sass,scss}',
			lint: './assets/sass/**/*.{css,sass,scss}'
		},
		{
			id: 'vendor',
			input: {
				path: './assets/sass/',
				file: 'vendor'
			},
			output: {
				path: './dist/css/',
				file: 'vendor'
			},
			watch: './assets/sass/**/*.{css,sass,scss}',
			lint: './assets/sass/**/*.{css,sass,scss}'
		}
	],
	options: {
		prefix: isProduction,
		minify: isProduction,
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
			id: 'main',
			input: {
				path: './assets/js/',
				file: 'app'
			},
			output: {
				path: './dist/js/',
				file: 'main'
			},
			watch: './assets/js/**/*.js',
			lint: ['./assets/js/**/*.js', '!**/vendor/**']
		}
	],
	options: {
		babel: isProduction,
		minify: isProduction,
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
		},
		{
			name: 'templates',
			input: './assets/templates/**/*.html',
			output: './dist/'
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
