const gulp      = require('gulp');
var header      = require('gulp-header');
const uglify    = require('gulp-uglify');
const minifyCss = require('gulp-minify-css');
const pkg       = require('./package.json');

let note = ["/* <%=name%> v<%=version%> by <%= author %>,doc:<%= url %> */\n", pkg];

gulp.task("makejs", function () {
    let js = ['src/*.js'];

    return gulp.src(js)
        .pipe(uglify())
        .pipe(header.apply(null, note))
        .pipe(gulp.dest('./dist/'));
});
gulp.task("makecss", function () {
    let js = ['src/*.css'];

    return gulp.src(js)
        .pipe(minifyCss({
            compatibility: 'ie7'
        }))
        .pipe(header.apply(null, note))
        .pipe(gulp.dest('./dist/'));
});