'use strict';

// --------------------------------------------------
// Require
// --------------------------------------------------

// General
const gulp          = require('gulp');
const rename        = require('gulp-rename');
const sourcemaps    = require('gulp-sourcemaps');
const { pipeline }  = require('readable-stream');

// CSS
const sass          = require('gulp-sass');
const postcss       = require('gulp-postcss');
const autoprefixer  = require('autoprefixer');
const cssnano       = require('cssnano');

// JS
const concat        = require('gulp-concat');
const babel         = require('gulp-babel');
const terser        = require('gulp-terser');

// --------------------------------------------------
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

// --------------------------------------------------
// Vars
// --------------------------------------------------

const buildTasks = [];
const watchTasks = [];

// --------------------------------------------------
// Gulp: Compile Sass
// --------------------------------------------------

const styleBuildTask = function(task) {

    const processors = [
        autoprefixer,
        cssnano
    ];

    const filename = {                              
        basename: task.name,
        suffix: '.min'
    };

    gulp.task(task.buildName, function() {
        return pipeline(
            gulp.src(task.files),
            sourcemaps.init(),                          // Init the sourcemap
            sass().on('error', sass.logError),          // Compile sass
            postcss(processors),                        // Apply PostCSS processors
            rename(filename),                           // Rename the file with the 'min' suffix 
            sourcemaps.write('.'),                      // Write the sourcemap
            gulp.dest(styles.dest)                      // Output the compiled css
        );
    });
}

const styleWatchTask = function(task) {
    gulp.task(task.watchName, function() {
        return gulp.watch(task.files, gulp.series(task.buildName));
    });
}


for (const [name, files] of Object.entries(styles.bundles)) {

    const task = {
        'buildName': 'build:css:' + name,
        'watchName': 'watch:css:' + name,
        'name': name,
        'files': files
    }

    styleBuildTask(task);
    styleWatchTask(task);

    buildTasks.push(task.buildName);
    watchTasks.push(task.watchName);
};

// --------------------------------------------------
// Gulp: Compile JavaScript
// --------------------------------------------------

const scriptBuildTask = function(task) {
    gulp.task(task.buildName, function() {
        return pipeline(
            gulp.src(task.files),
            sourcemaps.init(),                          // Init the sourcemap
            concat(task.name + '.min.js'),              // Combine files (and rename)
            babel({presets: ['@babel/env']}),           // Babel
            terser(),                                   // Minify
            sourcemaps.write('.'),                      // Write the sourcemap
            gulp.dest(scripts.dest)                     // Output the compiled js    
        );
    });
}

const scriptWatchTask = function(task) {
    gulp.task(task.watchName, function() {
        return gulp.watch(task.files, gulp.series(task.buildName));
    });
}

for (const [name, files] of Object.entries(scripts.bundles)) {

    const task = {
        'buildName': 'build:js:' + name,
        'watchName': 'watch:js:' + name,
        'name': name,
        'files': files
    }

    scriptBuildTask(task);
    scriptWatchTask(task);

    buildTasks.push(task.buildName);
    watchTasks.push(task.watchName);
};

// --------------------------------------------------
// Gulp: Default
// --------------------------------------------------

exports.default = gulp.series(
    gulp.parallel(buildTasks),
    gulp.parallel(watchTasks),
);