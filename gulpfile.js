
var babel = require('babel/register');
var browserify = require('browserify');
var config = require('./src/buildConfig.json');
var pkg = require('./package.json');
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minimist = require('minimist');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var header = require('gulp-header');
var sourcemaps = require('gulp-sourcemaps');
var gulp_babel = require('gulp-babel');
//var browserify = require('gulp-browserify');
var babelify = require("babelify");
var fs = require('fs');
var karma = require('karma').server;

config.options = minimist(process.argv.slice(2), config.buildDefaultOptions);
var paths = {
  js: ['src/**/*.js'],
  test: ['test/**/*.js']
}

gulp.task('default', ['babel:compile'], function() {});
gulp.task('bundle', function() {
    if (!fs.existsSync('dist')) fs.mkdirSync('dist');
    return browserify({
      standalone: '$data'
    })
    .transform(babelify)
    .require('src/index.js', { entry: true })
    .bundle()
    .on("error", function (err) { console.log("Error: " + err.message) })
    .pipe(fs.createWriteStream("dist/JayData.js"));
});

gulp.task('test', ['bundle'], function(done){
    karma.start({
    	configFile: __dirname + '/karma.conf.js',
    	singleRun: true
    }, function(){
        done();
    });
});

gulp.task('babel:compile', function() {
  return gulp.src(paths.js)
    .pipe(sourcemaps.init())
    .pipe(gulp_babel({
      modules: 'umd',
      comments: false
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build'));
});

gulp.task('release', ['JayData', 'providers', 'modules'], function() {
  return gulp.src("build/**/*.js")
    .pipe(header(fs.readFileSync('src/CREDITS.txt'), pkg))
    .pipe(gulp.dest("build"));
});

for (var i = 0; i < config.components.length; i++) {
  (function(taskName, dep, source, name, output) {
    if (source) {
      gulp.task(taskName, dep, function() {
        return gulpTask(source, name, output || config.options.output);
      });
    } else {
      gulp.task(taskName, dep);
    }
  })(config.components[i].taskName, config.components[i].dependencies, config.components[i].componentItems, config.components[i].fileName, config.components[i]
    .output);
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
