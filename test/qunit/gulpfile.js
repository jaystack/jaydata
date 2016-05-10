var gulp = require('gulp');
var qunit = require('node-qunit-phantomjs');

gulp.task('qunit', function () {
    return qunit('test.html');
});