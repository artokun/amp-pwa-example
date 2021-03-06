// Load plugins
const gulp = require('gulp'),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  minifycss = require('gulp-minify-css'),
  imagemin = require('gulp-imagemin'),
  rename = require('gulp-rename'),
  clean = require('gulp-clean'),
  notify = require('gulp-notify'),
  cache = require('gulp-cache'),
  livereload = require('gulp-livereload'),
  htmlmin = require('gulp-htmlmin'),
  htmlreplace = require('gulp-html-replace'),
  workboxBuild = require('workbox-build'),
  pwaManifest = require('pwa-manifest');
sequence = require('gulp-sequence');
(lr = require('tiny-lr')), (server = lr());

// Styles
gulp.task('styles', function() {
  return gulp
    .src([
      'src/scss/main.scss',
      'src/scss/amp-boilerplate.scss',
      'src/scss/amp-boilerplate-none.scss',
    ])
    .pipe(sass({ style: 'expanded' }))
    .pipe(
      autoprefixer(
        'last 2 version',
        'safari 5',
        'ie 8',
        'ie 9',
        'opera 12.1',
        'ios 6',
        'android 4'
      )
    )
    .pipe(gulp.dest('build/styles'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(livereload(server))
    .pipe(gulp.dest('build/styles'))
    .pipe(notify({ message: 'Styles task complete' }));
});

// HTML
gulp.task('html', function() {
  return gulp
    .src('src/*.html')
    .pipe(
      htmlreplace({
        cssInline: {
          src: gulp.src('build/styles/main.min.css'),
          tpl: '<style amp-custom>%s</style>',
        },
        ampBoilerplate:
          '<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>',
      })
    )
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('dist'));
});

// Public
gulp.task('public', function() {
  return gulp.src('public/*').pipe(gulp.dest('dist'));
});

// Images
gulp.task('images', function() {
  return gulp
    .src('src/images/**/*')
    .pipe(
      cache(
        imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })
      )
    )
    .pipe(livereload(server))
    .pipe(gulp.dest('dist/'))
    .pipe(notify({ message: 'Images task complete' }));
});

// Clean
gulp.task('clean', function() {
  return gulp
    .src(['build/styles', 'dist/images'], { read: false })
    .pipe(clean());
});

// Service Worker
gulp.task('service-worker', () => {
  return workboxBuild.generateSW({
    globDirectory: 'src',
    globPatterns: ['**/*.{html,json,js,css}'],
    swDest: 'dist/sw.js',
  });
});

// PWA Manifest
gulp.task('manifest', function() {
  pwaManifest({
    name: 'Red Letter Gospel',
    short_name: 'RLG',
    start_url: '/',
    display: 'standalone',
    background_color: '#EFEFEF',
    theme_color: '#FFFFFF',
  }).then(function(manifest) {
    // dump new generated manifest file if you want
    pwaManifest.write('./dist', manifest);
  });
});

// Default task
gulp.task(
  'default',
  sequence(
    'clean',
    'styles',
    'images',
    'html',
    'public',
    'manifest',
    'service-worker'
  )
);

// Watch
gulp.task('watch', ['default'], function() {
  // Listen on port 35729
  server.listen(35729, function(err) {
    if (err) {
      return console.log(err);
    }

    // Watch .html files
    gulp.watch('src/*.html', ['styles', 'html'], function(event) {
      console.log(
        'File ' + event.path + ' was ' + event.type + ', running tasks...'
      );
    });

    // Watch .scss files
    gulp.watch('src/scss/**/*.scss', ['styles', 'html'], function(event) {
      console.log(
        'File ' + event.path + ' was ' + event.type + ', running tasks...'
      );
    });

    // Watch image files
    gulp.watch('src/images/**/*', ['images'], function(event) {
      console.log(
        'File ' + event.path + ' was ' + event.type + ', running tasks...'
      );
    });
  });
});
