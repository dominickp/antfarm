var gulp = require('gulp'),
    ts = require('gulp-typescript'),
    mocha = require('gulp-mocha'),
    runSequence = require('run-sequence');


var tsProject = ts.createProject({
    declaration: true,
    noExternalResolve: true,
    module:'commonjs'
});

gulp.task('test', function() {
    gulp.src('test/**/*.spec.js', {read: false})
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
    runSequence('build',
        ['test'],
        callback);
});

gulp.task('watch', function(){
    gulp.watch('src/**/*.ts', ["build-test"]);
    gulp.watch('test/**/*.js', ["test"]);
});


gulp.task('default', ['build', 'test', 'watch']);
