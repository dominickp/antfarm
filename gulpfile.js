var gulp = require('gulp'),
    ts = require('gulp-typescript'),
    mocha = require('gulp-mocha'),
    runSequence = require('run-sequence'),
    typedoc = require("gulp-typedoc"),
    tslint = require("gulp-tslint"),
    stylish = require('tslint-stylish'),
    istanbul = require('gulp-istanbul'),
    plumber = require('gulp-plumber'),
    coveralls = require('gulp-coveralls');

process.setMaxListeners(0);

gulp.task("doc", function() {
    return gulp
        .src([
            "./src/**/*.ts"
        ])
        .pipe(typedoc({
            module: "commonjs",
            target: "es5",
            out: "./docs/",
            name: "Antfarm",
            ignoreCompilerErrors: false,
            includeDeclarations: false,
            mode: "file"
        }));
});

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

var tsProject = ts.createProject(
    'tsconfig.json',
    {
        declaration: true,
        noExternalResolve: true,
        module:'commonjs'
    }
);

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

gulp.task('test-travis', function (cb) {
    var mochaErr;
    // Track src files that should be covered
    gulp.src('test/**/*.spec.js')
        .pipe(istanbul({ includeUntested: true })) // Covering files
        .pipe(istanbul.hookRequire()) // Force `require` to return covered files
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
                 * finish. Without them, `gulp mocha` doesn't exit and Travis
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

//
// gulp.task('test-travis', function() {
//     return gulp.src('test/**/*.spec.js', {read: false})
//     // gulp-mocha needs filepaths so you can't have any plugins before it
//
//         .pipe(mocha({reporter: 'spec'}))
//         /**
//          * Keep track of latest error on Mocha. Because a failed test counts
//          * as an error, the process should not be exited until end of tests.
//          */
//         .on('error', function(err) {
//             /**
//              * This intermediate log is useful for when mocha crashes (as opposed
//              * to a test failing), especially necessary for Travis CI reporting.
//              * Without these logs, Travis CI will not report anything meaningful
//              * if mocha crashes. Can be commented out if desired.
//              */
//             console.error('ERROR:', err.message);
//             console.error('Stack:', err.stack);
//             mochaErr = err;
//         })
//         /**
//          * The methods below are a hack to get gulp to exit after mocha tests
//          * finish. Without them, `gulp mocha` doesn't exit and Travis
//          * never finishes running the tests.
//          */
//         .on('end', function () {
//             if (mochaErr) return handleMochaError(mochaErr);
//             // Force mocha to exit, because gulp-mocha is stupid.
//             process.exit();
//         });
// });

gulp.task('build', function() {
    var tsResult = gulp.src(['./src/**/*.ts', './devtypes/**/*.ts'])
        .pipe(ts(tsProject));
    tsResult.dts.pipe(gulp.dest('./'));
    return tsResult.js.pipe(gulp.dest('./'));
});

gulp.task('build-test', function(callback) {
    runSequence(
        'build',
        'test',
        'tslint',
        // 'typedoc',
        callback);
});

gulp.task('travis', function(callback) {
    runSequence(
        'build',
        'test-travis',
        callback);
});

gulp.task('watch', function(){
    gulp.watch('src/**/*.ts', ["build-test"]);
    gulp.watch('test/**/*.js', ["test"]);
});


gulp.task('default', ['build-test', 'watch']);
