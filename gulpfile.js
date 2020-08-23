const gulp      = require('gulp');
const replace   = require('gulp-replace');
const header    = require('gulp-header');
const uglify    = require('gulp-uglify');
const minifyCss = require('gulp-minify-css');
const pkg       = require('./package.json');

let note = ["/* <%=name%> v<%=version%> by <%= author %>,website:<%= url %> */\n", pkg];

gulp.task("makejs", function () {
    let js = ['src/*.js'];

    return gulp.src(js)

        .pipe(replace(/\$\{[a-zA-Z]+\}/g, function (match) {
            match = match.substr(
                match.indexOf('{') + 1,
                match.indexOf('}') - 2
            );
            return pkg[match];
        }))

        .pipe(uglify())
        .pipe(header.apply(null, note))
        .pipe(gulp.dest('./dist/'));
});
gulp.task("makecss", function () {
    let js = ['src/*.css'];

    return gulp.src(js)

        .pipe(replace(/\$\{[a-zA-Z]+\}/g, function (match) {
            match = match.substr(
                match.indexOf('{') + 1,
                match.indexOf('}') - 2
            );
            return pkg[match];
        }))

        .pipe(minifyCss({
            compatibility: 'ie7'
        }))
        .pipe(header.apply(null, note))
        .pipe(gulp.dest('./dist/'));
});