var browserify = require('browserify');
var config = require('./build/config.json');
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
var closureCompiler = require('gulp-closure-compiler');
var derequire = require('browserify-derequire');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var fs = require('fs');
var eslint = require('gulp-eslint');
var header = require('gulp-header');
var footer = require('gulp-footer');
var webserver = require('gulp-webserver');
var selenium = require('selenium-standalone');
var nightwatch = require('gulp-nightwatch');
var rename = require('gulp-rename');
var del = require('del');
var nugetpack = require('gulp-nuget-pack');
var zip = require('gulp-vinyl-zip');
var npm = require('npm');
var argv = require('yargs').argv;
var exec = require('child_process').exec;

config.options = minimist(process.argv.slice(2), config.buildDefaultOptions);
var paths = {
  js: ['src/**/*.js'],
  test: ['test/**/*.js']
}

gulp.task('default', ['all']);
if (!fs.existsSync('./dist')) fs.mkdirSync('./dist');

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
    .pipe(eslint.format('compact', fs.createWriteStream('./dist/.eslint')))
    .pipe(eslint.failAfterError())
});

gulp.task('nodejs', function() {
    return gulp.src(['src/**/*.js'])
    .pipe(babel({
        compact: false
    }))
    .pipe(gulp.dest('./dist/lib'))
    .on('error', function(err){
		console.log('>>> ERROR', err);
		this.emit('end');
	});
});

gulp.task('jaydata.min', function(){
    return gulp.src('./dist/public/jaydata.js')
    .pipe(closureCompiler({
        compilerPath: './node_modules/google-closure-compiler/compiler.jar',
        fileName: 'dist/public/jaydata.min.js'
    }))
    .pipe(gulp.dest('./dist/public'));
});

gulp.task('minify', ['bundle'], function(){
    return gulp.src('./dist/public/**/*.js')
    .pipe(uglify({
        preserveComments: 'license'
    }))
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest('./dist/public'));
});

gulp.task('clean', function(){
    return del([
        './dist/.eslint',
        './dist/lib',
        './dist/public'
    ]);
});

gulp.task('nuget', ['bundle'], function(done){
    if (!fs.existsSync('./release')) fs.mkdirSync('./release');
    nugetpack({
        id: "JayData",
        title: "JayData",
        version: pkg.version,
        dependencies: [
            { id: "jQuery", version: "1.8" },
            { id: "odatajs", version: "4.0" }
        ],
        authors: "JayStack Technologies",
        owners: "JayStack Technologies",
        projectUrl: "http://jaydata.org",
        iconUrl: "http://jaydata.org/Themes/Bootstrap/Styles/img/logo_jaydata_5.png",
        licenseUrl: "http://jaydata.org/licensing",
        requireLicenseAcceptance: true,
        copyright: "JayStack Technologies",
        summary: "JayData is a standards-based (mostly HTML5), cross-platform Javascript library and a set of practices to access and manipulate data from various online and offline sources.",
        description: "The unified data-management library for JavaScript/HTML5",
        tags: "jaydata jslq javascript js html5 data management odata indexeddb sqlite azure yql facebook fql mongodb HTML5 localStorage knockout kendoui angular opensource cross-platform cross-layer",
        outputDir: "./release/nugetpkg",
        baseDir: "./dist/public"
    }, [
        './dist/public'
    ], done);
});

gulp.task('release', ['bundle'], function(){
    if (!fs.existsSync('./release')) fs.mkdirSync('./release');
    return gulp.src(['./dist/public/**/*', './build/*.txt', './jaydata.d.ts'])
    .pipe(zip.dest('./release/jaydata.zip'));
});

gulp.task('npm', /*['nodejs', 'bundle', 'lint'],*/ function (callback) {
    var username = argv.username;
    var password = argv.password;
    var email = argv.email;

    if (!username) {
        var usernameError = new Error("Username is required as an argument --username exampleUsername");
        return callback(usernameError);
    }
    if (!password) {
        var passwordError = new Error("Password is required as an argument --password  examplepassword");
        return callback(passwordError);
    }
    if (!email) {
        var emailError = new Error("Email is required as an argument --email example@email.com");
        return callback(emailError);
    }

    var uri = "http://registry.npmjs.org/";
    npm.load(null, function (loadError) {
        if (loadError) {
            return callback(loadError);
        }
        var auth = {
            username: username,
            password: password,
            email: email,
            alwaysAuth: true
        };
        var addUserParams = {
            auth: auth
        };
        npm.registry.adduser(uri, addUserParams, function (addUserError, data, raw, res) {
            if (addUserError) {
                return callback(addUserError);
            }

            var metadata = require('./dist/package.json');
            metadata = JSON.parse(JSON.stringify(metadata));
            npm.commands.pack(['./dist'], function (packError) {
                if (packError) {
                    return callback(packError);
                }
                var fileName = metadata.name + '-' + metadata.version + '.tgz';
                var bodyPath = require.resolve('./' + fileName);
                var body = fs.createReadStream(bodyPath);
                var publishParams = {
                    metadata: metadata,
                    access: 'public',
                    tag: 'next',
                    body: body,
                    auth: auth
                };
                npm.registry.publish(uri, publishParams, function (publishError, resp) {
                    if (publishError) {
                        return callback(publishError);
                    }
                    console.log("Publish succesfull: " + JSON.stringify(resp));
                    return callback();
                });
            })
        });
    });
});

var webserverInstance;
gulp.task('webserver', function() {
    webserverInstance = gulp.src('./')
    .pipe(webserver({
        port: 53999
    }));
    return webserverInstance;
});

gulp.task('selenium', function (done) {
    selenium.install({
        logger: function (message) { }
    }, function (err) {
        if (err) return done(err);

        selenium.start(function (err, child) {
            if (err) return done(err);
            selenium.child = child;
            done();
        });
    });
});

gulp.task('test', ['webserver', 'selenium'/*'bundle'*/], function(){
    return gulp.src('')
    .pipe(nightwatch({
        configFile: './nightwatch.conf.json'/*,
        cliArgs: {
            env: 'chrome',
            tag: 'sandbox'
        }*/
    })).on('end', function(){
        process.exit(0);
    });

    /*karma.start({
    	configFile: __dirname + '/karma.conf.js',
    	singleRun: true
    }, function(){
        done();
    });*/
});

gulp.task('apidocs', ['jaydata'], function (cb) {
    exec('"./node_modules/.bin/jsdoc" "./dist/public/jaydata.js" -t "./node_modules/jaguarjs-jsdoc" -d apidocs', function (err, stdout, stderr) {
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
    td.browserify.debug = true;
    var task = browserify(td.browserify).transform(babelify.configure({
        compact: false,
        presets: ["es2015"],
        plugins: ["add-module-exports"]
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
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }));

    if (td.header){
        task = task.pipe(header(fs.readFileSync(td.header, 'utf8'), { pkg: pkg }));
    }
    task = task.pipe(header(fs.readFileSync('./build/CREDITS.txt'), pkg));

    if (td.footer){
        task = task.pipe(footer(fs.readFileSync(td.footer, 'utf8'), { pkg: pkg }));
    }

    task = task
        .pipe(gulp.dest(td.destFolder))
        .pipe(uglify({
            preserveComments: 'license'
        }))
        .pipe(rename({ extname: '.min.js' }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(td.destFolder));

    return task;

}
