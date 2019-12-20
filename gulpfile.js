// Require
// --------------------------------------------------

// General
const gulp          = require('gulp');
const rename        = require('gulp-rename');
const sourcemaps    = require('gulp-sourcemaps');

// CSS
const sass          = require('gulp-sass');
const postcss       = require('gulp-postcss');
const autoprefixer  = require('autoprefixer');
const cssnano       = require('cssnano');

// JS
const concat        = require('gulp-concat');

// Settings & Configuration
// --------------------------------------------------

const styles = {
    dest: 'dist/css/',
    bundles: {
        'styles': 'src/sass/**/*.{scss,sass}'
    }
};

const scripts = {
    dest: 'dist/js/',
    bundles: {
        'main': [
            'src/js/script-1.js',
            'src/js/script-2.js',
        ],
        'vendor': [
            'src/js/script-3.js'
        ]
    }
};

// Gulp: Compile Sass
// --------------------------------------------------

const processors = [
    autoprefixer,
    cssnano
];

var cssBundles = Object.keys(styles.bundles);

cssBundles.forEach(function(bundleName) {
    const filename = {                              
        basename: bundleName,
        suffix: '.min'
    };

    gulp.task(bundleName, function () {
        return gulp
            .src(styles.bundles[bundleName])
            .pipe(sourcemaps.init())                    // Initialize the sourcemap
            .pipe(sass().on('error', sass.logError))    // Compile sass to css
            .pipe(postcss(processors))                  // Apply PostCSS processors to css
            .pipe(rename(filename))                     // Rename the file with the 'min' prefix 
            .pipe(sourcemaps.write('.'))                // Write the sourcemap file to the current directory
            .pipe(gulp.dest(styles.dest));              // Output the compiled css
    });
});

gulp.task('styles',
    gulp.parallel(
        cssBundles.map(name => { return name; })
    )
);

// Gulp: Compile JavaScript
// --------------------------------------------------

var jsBundles = Object.keys(scripts.bundles);

jsBundles.forEach(function(bundleName) {
    gulp.task(bundleName, function () {
        return gulp
            .src(scripts.bundles[bundleName])
            .pipe(sourcemaps.init())                    // Initialize the sourcemap
            .pipe(concat(bundleName + '.min.js'))       // Rename the file with the 'min' prefix 
            .pipe(sourcemaps.write('.'))                // Write the sourcemap file to the current directory
            .pipe(gulp.dest(scripts.dest));             // Output the compiled js
    });
});

gulp.task('js',
    gulp.parallel(
        jsBundles.map(name => { return name; })
    )
);