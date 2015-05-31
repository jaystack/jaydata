var config = require('./buildConfig.json');
var pkg = require('./package.json');
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minimist = require('minimist');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var header = require('gulp-header');
var fs = require('fs');


config.options = minimist(process.argv.slice(2), config.buildDefaultOptions);
//console.log(config);
//console.log(pkg.version);

gulp.task('release',['JayData', 'providers', 'modules'], function () {
    return gulp.src("build/**/*.js")
               .pipe(header(fs.readFileSync('CREDITS.txt'), pkg))
               .pipe(gulp.dest("build"));
});

for (var i = 0; i < config.components.length; i++) {
    (function (taskName, dep, source, name, output) {
        if (source) {
            gulp.task(taskName, dep, function () {
                return gulpTask(source, name, output || config.options.output);
            });
        } else {
            gulp.task(taskName, dep);
        }
    })(config.components[i].taskName, config.components[i].dependencies, config.components[i].componentItems, config.components[i].fileName, config.components[i].output);
}

function gulpTask(srcList, resultName, destFolder) {
    var task = gulp.src(srcList)
                .pipe(concat(resultName + '.js'))
                .pipe(gulp.dest(destFolder));
    
    if (config.options.min) {
        task = task.pipe(rename(resultName + '.min.js'))
                .pipe(uglify())
                .pipe(gulp.dest(destFolder));
    }
    return task;
}