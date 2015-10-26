require('babel/register');
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
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var closureCompiler = require('gulp-closure-compiler');
var derequire = require('browserify-derequire');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var fs = require('fs');
var karma = require('karma').server;

config.options = minimist(process.argv.slice(2), config.buildDefaultOptions);
var paths = {
  js: ['src/**/*.js'],
  test: ['test/**/*.js']
}

gulp.task('default', ['babel:compile'], function() {});

gulp.task('jaydata', function() {
    return browserify()
    .transform(babelify)
    .require('./src/index.js', { expose: 'jaydata/core' })
    .bundle()
    .on("error", function (err) { console.log("Error: " + err.message) })
    .pipe(source('jaydata.js'))
    .pipe(buffer())
    //.pipe(uglify())
    .pipe(gulp.dest('./dist/public'));
});

gulp.task('odataprovider', function() {
    if (!fs.existsSync('dist')) fs.mkdirSync('dist');
    return browserify({
        standalone: '$data'
    })
    .transform(babelify)
    .require('./src/Types/StorageProviders/oData/index.js', { entry: true })
    .external('jaydata/core')
    .bundle()
    .on("error", function (err) { console.log("Error: " + err.message) })
    .pipe(source('oDataProvider.js'))
    .pipe(buffer())
    //.pipe(uglify())
    .pipe(gulp.dest('./dist/public/jaydataproviders'));
});

gulp.task('nodejs', function() {
    return gulp.src(['src/**/*.js'])
    .pipe(babel())
    .on('error', function(err){
		console.log('>>> ERROR', err);
		this.emit('end');
	})
    .pipe(gulp.dest('./dist/lib'));
});

/*gulp.task('jaydata.min', function(){
    return gulp.src('./dist/jaydata.js')
    .pipe(closureCompiler({
        compilerPath: './node_modules/google-closure-compiler/compiler.jar',
        fileName: 'dist/jaydata.min.js'
    }))
    .pipe(gulp.dest('./dist'));
});*/

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
