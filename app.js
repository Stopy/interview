var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;

var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// var logger = require('morgan');
// var log = require('logger')(module);
var config = require('config');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'secretString',
  cookie: { maxAge: 3600000 * 12 , httpOnly: true}, // Сессия на 12 часов
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({url: 'mongodb://localhost/sessions'})
}));
app.use("/", express.static(__dirname + '/public'));
console.log(process.env.NODE_ENV || 'development');

MongoClient.connect('mongodb://localhost:27017/brolaf', function(err, db) {
  
  if(err) {
    console.log('Sorry, there is no db server running.');
  }
  else {
    require('./router.js')(app, config, db);
    var server = app.listen(config.port, function () {
      console.log('Server is running at ' + server.address().port);
    });
  }

});