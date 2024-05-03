const cookieParser = require('cookie-parser')
const createError = require('http-errors')
const express = require('express')
const logger = require('morgan')
const path = require('path')

const { getBundles } = require('./lib/static')
const indexRouter = require('./routes/index')
const systemRouter = require('./routes/system')

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.set('env', process.env.NODE_ENV || 'production')

app.use(logger('dev'))
app.use(express.raw())
app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 3_600_000 * 24 * 365
}))

// Static bundles
const bundles = getBundles()
app.use(function (req, res, next) {
  res.locals.bundles = bundles
  next()
})

app.use('/', systemRouter)
app.use('/', indexRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
