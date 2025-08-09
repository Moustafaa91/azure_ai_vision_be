var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const securityMiddleware = require('./middleware/security');
const securityConfig = require('./config/security');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var helloRouter = require('./routes/hello');
const imageAnalysisRouter = require('./routes/ImageAnalysis');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Apply security middleware globally
app.use(securityMiddleware.securityHeaders);
app.use(securityMiddleware.validateRequest);
app.use(securityMiddleware.logIP);
app.use(securityMiddleware.globalRateLimit);

app.use(logger('dev'));
app.use(express.json({ limit: securityConfig.requestLimits.maxJsonSize }));
app.use(express.urlencoded({ extended: false, limit: securityConfig.requestLimits.maxJsonSize }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/hello', helloRouter);
app.use('/api', imageAnalysisRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(securityMiddleware.errorHandler);

module.exports = app;
