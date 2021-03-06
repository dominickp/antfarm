var gulp = require('gulp'),
    ts = require('gulp-typescript'),
    mocha = require('gulp-mocha'),
    runSequence = require('run-sequence'),
    typedoc = require("gulp-typedoc"),
    tslint = require("gulp-tslint"),
    stylish = require('tslint-stylish'),
    istanbul = require('gulp-istanbul'),
    plumber = require('gulp-plumber'),
    coveralls = require('gulp-coveralls'),
    merge = require('merge2'),
    del = require('del'),
    sourcemaps = require('gulp-sourcemaps');

process.setMaxListeners(0);


/* ---------------- Typedoc ---------------- */

gulp.task("doc", function() {
    return gulp
        .src([
            "./src/**/*.ts"
        ])
        .pipe(typedoc({
            module: "commonjs",
            target: "es5",
            out: "./docs/",
            name: "Antfarm 🐜",
            ignoreCompilerErrors: false,
            includeDeclarations: false,
            mode: "file",
            media: "./src/docs/media",
            theme: "./src/docs/theme"
        }));
});

gulp.task('docs', ['doc']);

/* ---------------- Tslint ---------------- */

gulp.task("tslint", function() {
    gulp.src([
        "!./src/**/*.d.ts",
        "./src/**/*.ts"
    ])
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report(stylish, {
            emitError: false,
            sort: true,
            bell: true
        }));
});


/* ---------------- Typescript ---------------- */

var tsProject = ts.createProject('tsconfig.json');

gulp.task('build', function() {
    var tsResult = gulp.src([
        './src/index.ts',
        './src/**/*.ts',
        './devtypes/**/*.ts',
    ])
        .pipe(sourcemaps.init()) // This means sourcemaps will be generated
        .pipe(tsProject());

    return merge([ // Merge the two output streams, so this task is finished when the IO of both operations is done.
        tsResult.dts.pipe(gulp.dest('./')),
        tsResult.js.pipe(sourcemaps.write()),
        tsResult.js.pipe(gulp.dest('./')),
    ]);
});

gulp.task('clean:build', function () {
    return del('./lib');
});

/* ---------------- Mocha ---------------- */

/**
 * handleMochaError
 * ================
 * Simple error handling specifically for mocha. Reports the latest error
 * encountered, then uses `process.exit(1)` to force an exit from the gulp
 * task and communicate that an error occurred (e.g. to Travis CI).
 */
var mochaErr;
var handleMochaError = function (err) {
    console.log('Mocha encountered an error, exiting with status 1');
    console.log('Error:', err.message);
    process.exit(1);
};

function handleError(err) {
    console.log(err.toString());
    this.emit('end');
}

gulp.task('test', function() {
    return gulp.src('test/**/*.spec.js', {read: false})
    // gulp-mocha needs filepaths so you can't have any plugins before it
        .pipe(mocha({reporter: 'nyan'})
        .on("error", handleError));
});

/* ---------------- Travis ---------------- */

gulp.task('test-travis', function (cb) {
    var mochaErr;
    // Track src _files that should be covered
    gulp.src('test/**/*.spec.js')
        .pipe(istanbul({ includeUntested: true })) // Covering _files
        .pipe(istanbul.hookRequire()) // Force `require` to return covered _files
        .on('finish', function() {
            return gulp.src('test/**/*.spec.js', {read: false})
            // gulp-mocha needs filepaths so you can't have any plugins before it

                .pipe(mocha({reporter: 'spec'}))
                .pipe(istanbul.writeReports())
                /**
                 * Keep track of latest error on Mocha. Because a failed test counts
                 * as an error, the process should not be exited until end of tests.
                 */
                .on('error', function(err) {
                    /**
                     * This intermediate log is useful for when mocha crashes (as opposed
                     * to a test failing), especially necessary for Travis CI reporting.
                     * Without these logs, Travis CI will not report anything meaningful
                     * if mocha crashes. Can be commented out if desired.
                     */
                    console.error('ERROR:', err.message);
                    console.error('Stack:', err.stack);
                    mochaErr = err;
                })

                /**
                 * The methods below are a hack to get gulp to exit after mocha tests
                 * _finish. Without them, `gulp mocha` doesn't exit and Travis
                 * never finishes running the tests.
                 */
                .on('end', function () {
                    if (mochaErr) return handleMochaError(mochaErr);
                    // Force mocha to exit, because gulp-mocha is stupid.
                    process.exit();
                })

        });
});

gulp.task('coveralls-travis', function () {
    // if (!process.env.CI) return;
    return gulp.src('./coverage/**/lcov.info')
        .pipe(coveralls());
});

gulp.task('travis', function(callback) {
    runSequence(
        'build',
        'test-travis',
        callback);
});

/* ---------------- Build ---------------- */

gulp.task('build-test', function(callback) {
    runSequence(
        'clean:build',
        'build',
        'test',
        'tslint',
        // 'typedoc',
        callback);
});

gulp.task('watch', function(){
    gulp.watch(['src/**/*.ts','!src/docs/**/*'], ["build-test"]);
    gulp.watch('test/**/*.js', ["test"]);
});

gulp.task('default', ['build-test', 'watch']);