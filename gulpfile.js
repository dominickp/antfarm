var gulp = require('gulp'),
    ts = require('gulp-typescript'),
    mocha = require('gulp-mocha'),
    runSequence = require('run-sequence'),
    typedoc = require("gulp-typedoc"),
    tslint = require("gulp-tslint"),
    stylish = require('tslint-stylish');

gulp.task("doc", function() {
    return gulp
        .src(["./src/**/*.ts"])
        .pipe(typedoc({
            module: "commonjs",
            target: "es5",
            out: "./docs/",
            name: "Antfarm",
            ignoreCompilerErrors: false,
            includeDeclarations: false
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

gulp.task('test', function() {
    return gulp.src('test/**/*.spec.js', {read: false})
    // gulp-mocha needs filepaths so you can't have any plugins before it
        .pipe(mocha({reporter: 'landing'}))
});

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

gulp.task('watch', function(){
    gulp.watch('src/**/*.ts', ["build-test"]);
    gulp.watch('test/**/*.js', ["test"]);
});


gulp.task('default', ['build-test', 'watch']);
