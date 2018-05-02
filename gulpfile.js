"use strict";
var gulp = require('gulp');
var tsc = require('gulp-typescript');
var tsProject = tsc.createProject('tsconfig.json', { noImplicitAny: false });
var config = require('./gulpConfig');
var merge = require('merge2');
var del = require('del')

//We should delete the dist folder everytime before building
gulp.task('compile-all', function () {
    var sourceTsFiles = [config.allts,
    config.allTypings
    ];

    var tsResult = gulp.src(sourceTsFiles)
        .pipe(tsProject());
    return merge([ // Merge the two output streams, so this task is finished when the IO of both operations is done.
        tsResult.dts.pipe(gulp.dest(config.outputFolder)),
        tsResult.js.pipe(gulp.dest(config.outputFolder))
    ]);
});

gulp.task('watch', ['compile-all'], function () {
    gulp.watch(config.allts, ['compile-all']);
});

gulp.task('clean', function () {
    return del(['dist']);
});

gulp.task('clean-build', ['clean', 'compile-all']);

gulp.task('default', ['clean-build']);