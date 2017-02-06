/* eslint import/no-extraneous-dependencies: ["error", {"optionalDependencies": false}] */

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const exec = require('child_process').exec;
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const pump = require('pump');
const Server = require('karma').Server;

const createBundle = (pth) => {
    return browserify(pth, {standalone: 'Autocomplete'}).transform('babelify', {presets: ['es2015']});
};

const bob = (bundler, done, src, dest) => {

    console.log('Bob reluctantly starts building again...');

    pump([
        bundler.bundle().on('error', err => { console.error(err); this.emit('end'); }),
        source(src),
        buffer(),
        sourcemaps.init({loadMaps: true}),
        sourcemaps.write('.'),
        gulp.dest(dest)],
        () => {
            console.log('Bob finished building... "Ho Hum..."');
            if (typeof done === 'function') done();
        });
};

const test = done => {

    const server = new Server({
        configFile: `${__dirname}/karma.conf.js`,
        singleRun: true
    }, () => {
        if (typeof done === 'function') done();
    });

    server.start();
};

const serve = () => {

    const server = exec('node ./server', (error, stdout, stderr) => {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });

    const exit = () => {
        server.kill();
        process.exit(0);
    };

    process.on('SIGINT', exit);
    process.on('SIGTERM', exit);

};

gulp.task('build', done => {
    bob(createBundle('./src/autocomplete-js-google.js'), done, './autocomplete-js-google.js', './dist');
});

gulp.task('build-test', () => {
    bob(createBundle('./_test/autocomplete-js-google.test.js'), test, './compiled/autocomplete-js-google.test.js', './_test');
});

gulp.task('watch', () => {
    serve();
    gulp.watch(['./src/**/*.*', './_test/*.*'], ['build', 'build-test']);
});

gulp.task('test', done => {
    test(done);
});

gulp.task('dist', () => {
    return createBundle('./src/autocomplete-js-google.js').bundle()
        .on('error', err => { console.error(err); this.emit('end'); })
        .pipe(source('./autocomplete-js-google.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist'));
});
