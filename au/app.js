
var express = require('express')
  , http = require('http')
  , passportAuthentication = require('./passportAuthentication');

var config = require('./application');
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'blahblah' }));
  app.use(function(req, res, next) {
    req.applicationid = config.application.id; // TODO seal it
    next();
  });
  app.use(passportAuthentication.myauthentication);
  app.use(passportAuthentication.handleError);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res, next){
  var username = (req.user && req.user.username ? req.user.username : 'undefined');
  console.log("Session user: " + username);
  res.send("index: " + username);
});

app.get('/alma', passportAuthentication.ensureAuthenticated, function(req, res, next){
  var username = (req.user && req.user.username ? req.user.username : 'undefined');
  console.log("Session user: " + username);
  console.log(req.user);
  res.send("alma: " + username);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
