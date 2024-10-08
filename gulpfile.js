const { src, dest, parallel, series, watch } = require('gulp')
const fs = require('fs')
const clean = require('gulp-clean')
const uglifyCSS = require('gulp-clean-css')
const concat = require('gulp-concat')
const hash = require('gulp-hash-filename')
const uglifyJS = require('gulp-uglify')
const order = require('ordered-read-streams')

const HASH_FORMAT = '{name}.{hash:6}{ext}'

const init = (cb) => {
  ;['public/css', 'public/js'].forEach(
    (x) => fs.existsSync(x) || fs.mkdirSync(x, { recursive: true })
  )
  cb()
}

const cleanCSS = () => src('public/css/*').pipe(clean())

const cleanJS = () => src('public/js/*').pipe(clean())

const build = (type, sources, compile) =>
  order(
    [src(`client/${type}/vendor/*.min.${type}`)].concat(
      sources.map((s) => src(`client/${type}/${s}.${type}`).pipe(compile()))
    )
  )
    .pipe(concat(`bundle.${type}`))
    .pipe(hash({ format: HASH_FORMAT }))
    .pipe(dest(`public/${type}`))

const buildCSS = () => build('css', ['main'], uglifyCSS)
const buildJS = () => build('js', ['utils', 'editor', 'main'], uglifyJS)

const css = series(cleanCSS, buildCSS)
const js = series(cleanJS, buildJS)
const favicon = () => src('client/img/icon.svg').pipe(dest('public'))

const watchCSS = () => watch('client/css/**', { ignoreInitial: false }, css)
const watchJS = () => watch('client/js/**', { ignoreInitial: false }, js)

module.exports = {
  default: series(init, parallel(css, js, favicon)),
  watch: series(init, parallel(watchCSS, watchJS)),
}
