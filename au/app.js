
var c = require('express')
  , http = require('http')
  , passportAuthentication = require('./passportAuthentication');

var config = require('./application');
var app = c();

//app.configure(function(){
  //app.set('port', process.env.PORT || 4444);
  //app.use(c.logger('dev'));
  app.use(c.bodyParser());
  app.use(c.cookieParser());
  app.use(c.methodOverride());
  app.use(c.session({ secret: 'blahblah' }));
  app.use(function(req, res, next) {
    req.applicationid = config.application.id; // TODO seal it
    next();
  });
  app.use(passportAuthentication.myauthentication);
  app.use(passportAuthentication.handleError);
//});

//app.configure('development', function(){
  app.use(c.errorHandler());
//});

app.use('/alma', passportAuthentication.ensureAuthenticated, function(req, res, next){
  var username = (req.user && req.user.Login ? req.user.Login : 'undefined');
  console.log("Session user: ", username);
  //console.log(req.user);
  console.log(req);
  res.write("alma: " + username);
  res.end();
});

app.use('/', function(req, res, next){
  console.log(req.user);
  var username = (req.user && req.user.Login ? req.user.Login : 'undefined');
  console.log("Session user: ", username);
  res.write("index: " + username);
  res.end();
});

http.createServer(app).listen(4444, function(){
  console.log("Express server listening on port " + 4444);
});
