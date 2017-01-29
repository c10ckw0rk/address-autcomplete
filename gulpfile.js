/* eslint import/no-extraneous-dependencies: ["error", {"optionalDependencies": false}] */

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const pump = require('pump');
const Server = require('karma').Server;

const bundler = browserify('./src/TypeAhead-Google.js').transform('babelify', {presets: ['es2015']});

gulp.task('build', done => {
    pump([
        bundler.bundle().on('error', err => { console.error(err); this.emit('end'); }),
        source('./TypeAhead-Google.js'),
        buffer(),
        sourcemaps.init({loadMaps: true}),
        sourcemaps.write('.'),
        gulp.dest('./dist')],
        done);
});

gulp.task('watch', () => {
    gulp.watch('./src/**/*.*', ['build', 'test']);
});

/**
 * Run test once and exit
 */
gulp.task('test', done => {
    new Server({
        configFile: `${__dirname}/karma.conf.js`,
        singleRun: true
    }, () => {
        console.log('test complete');
        done();
    }).start();
});

gulp.task('dist', () => {
    return bundler.bundle()
        .on('error', err => { console.error(err); this.emit('end'); })
        .pipe(source('./TypeAhead-Google.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist'));
});
