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
var exec = require('child_process').exec;
var eslint = require('gulp-eslint');
var header = require('gulp-header');
var footer = require('gulp-footer');
var pkg = require('./package.json');

config.options = minimist(process.argv.slice(2), config.buildDefaultOptions);
var paths = {
  js: ['src/**/*.js'],
  test: ['test/**/*.js']
}

gulp.task('default', ['babel:compile'], function() {});

/*gulp.task('jaydata_tmp', function() {
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

gulp.task('odataprovider_tmp', function() {
    if (!fs.existsSync('dist')) fs.mkdirSync('dist');
    return browserify({
        standalone: '$data'
    })
    .transform(babelify)
    .require('./src/Types/StorageProviders/oData/index.js', { entry: true })
    .external('jaydata/core')
    .ignore('odatajs')
    .bundle()
    .on("error", function (err) { console.log("Error: " + err.message) })
    .pipe(source('oDataProvider.js'))
    .pipe(buffer())
    //.pipe(uglify())
    .pipe(gulp.dest('./dist/public/jaydataproviders'));
});*/

gulp.task('lint', function(){
    return gulp.src(['src/**/*.js'])
    .pipe(eslint({
        parser: 'babel-eslint',
        env: {
            browser: true,
            node: true,
            es6: true
        },
        ecmaFeatures: {
            modules: true
        },
        rules: {
            'no-undef': 1,
            'no-unused-vars': 1,
            'no-use-before-define': 1
        }
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

//gulp.task('bundle', ['lint', 'jaydata', 'odataprovider', 'sqliteprovider'])

gulp.task('nodejs', function() {
    return gulp.src(['src/**/*.js'])
    .pipe(babel())
    .pipe(gulp.dest('./dist/lib'))
    .on('error', function(err){
		console.log('>>> ERROR', err);
		this.emit('end');
	});
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


gulp.task('apidocs', ['jaydata'], function (cb) {
    exec('node_modules\\.bin\\jsdoc dist\\public\\jaydata.js -t node_modules\\jaguarjs-jsdoc -d apidocs', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});


for (var i = 0; i < config.components.length; i++) {
  (function(td) {
    if (td.browserify) {
      gulp.task(td.taskName, td.dependencies, function() {
        return gulpTask(td, config);
      });
    } else {
      gulp.task(td.taskName, td.dependencies);
    }
  })(config.components[i]);
}

function gulpTask(td, config){

    var task = browserify(td.browserify).transform(babelify.configure({
        compact: false
    }));
    task = task.require.apply(task, td.require);

    if(td.external){
        for (var i = 0; i < td.external.length; i++){
            task = task.external(td.external[i]);
        }
    }

    if(td.ignore){
        for (var i = 0; i < td.ignore.length; i++){
            task = task.ignore(td.ignore[i]);
        }
    }

    task = task.bundle()
        .on("error", function (err) { console.log("Error: " + err.message) })
        .pipe(source(td.destFile))
        .pipe(buffer());

    if(config.options.min){
        task = task.pipe(uglify());
    }

    if (td.header){
        task = task.pipe(header(fs.readFileSync(td.header, 'utf8'), { pkg: pkg }));
    }

    if (td.footer){
        task = task.pipe(footer(fs.readFileSync(td.footer, 'utf8'), { pkg: pkg }));
    }

    task = task.pipe(gulp.dest(td.destFolder));

    return task;

}
