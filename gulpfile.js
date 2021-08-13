const { src, dest, watch, parallel, series } = require('gulp');
const scss = require('gulp-sass');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');
const webp = require('gulp-webp');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const fonter = require('gulp-fonter');
const gulpWebp = require('gulp-webp');


function styles() {
    return src([
            'app/scss/style.scss',
            'node_modules/normalize.css/normalize.css',
            'node_modules/slick-carousel/slick/slick.css',
            'node_modules/magnific-popup/dist/magnific-popup.css',
        ])
        .pipe(scss({ outputStyle: 'compressed' }))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function scripts() {
    return src([
            'node_modules/jquery/dist/jquery.js',
            'app/js/main.js',
            'node_modules/slick-carousel/slick/slick.js',
            'node_modules/magnific-popup/dist/jquery.magnific-popup.js',
        ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}


function fonts() {
    src('app/fonts/**/*.ttf')
        .pipe(ttf2woff())
        .pipe(dest('dist/fonts'));
    return src('app/fonts/**/*.ttf')
        .pipe(ttf2woff2())
        .pipe(dest('dist/fonts'));
}

function cleanDist() {
    return del('dist')
}

function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        }
    });
}

function images() {
    return src('app/images/**/*')
        .pipe(
            webp({
                quality: 70
            })
        )
        .pipe(dest('dist/images'))
        .pipe(imagemin(
            [
                imagemin.gifsicle({ interlaced: true }),
                imagemin.mozjpeg({ quality: 75, progressive: true }),
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.svgo({
                    plugins: [
                        { removeViewBox: true },
                        { cleanupIDs: false }
                    ]
                })
            ]
        ))
        .pipe(dest('dist/images'))
}


function build() {
    return src([
            'app/css/style.min.css',
            'app/fonts/**/*',
            'app/js/main.min.js',
            'app/*.html'
        ], { base: 'app' })
        .pipe(dest('dist'))
}

function watching() {
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch(['app/*.html']).on('change', browserSync.reload);
}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.fonts = fonts;
exports.images = images;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, images, build, fonts);
exports.default = parallel(styles, scripts, browsersync, watching);