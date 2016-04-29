var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var io = require('socket.io').listen();
io.on('connection', function(socket) {
  //console.log('A user connected');
  socket.on('user info', function(data) {
    socket.userId = data.userId;
    if (data.userNickname == socket.userNickname) {
      return;
    }
    var welcomeMsg = (!socket.userNickname) ? data.userNickname + ' is online' : socket.userNickname + ' renamed to ' + data.userNickname;
    socket.userNickname = data.userNickname;

    io.emit('name message', welcomeMsg);
  });

  socket.on('chat message', function(data) {
    //console.log('msg: ' + JSON.toString(data));
    data.userId = socket.userId;
    data.userNickname = socket.userNickname;
    io.emit('chat message', data);
  });
});

app.set('io', io);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
