
var q = require('q');

var authentication = require('./authentication');

var passport = require('passport')
  , BasicStrategy = require('passport-http').BasicStrategy;

passport.use(new BasicStrategy(
  function(userid, password, done) {
    var promise = authentication.authenticate(userid, password);
    q.when(promise)
      .then( function(result) {
        console.log('approved');
        done(null, promise.valueOf());
      })
      .fail( function(reason) {
        console.log('rejected');
        done(reason);
      });
  }
));

passport.serializeUser(function(userid, done) {
  console.log("Serializing: ", userid);
  done(null, userid);
});

passport.deserializeUser(function(userid, done) {
  console.log("Deserializing: ", userid);
  done(null, userid);
});

module.exports = {

  myauthentication: function(req, res, next) {
    passport.initialize()(req, res, function() {
      passport.session()(req, res, function() {
        if (req.isAuthenticated()) { next(); return; }
	    if (req.header('authorization')) {
	      passport.authenticate('basic', { session: true })(req, res, next);
        } else {
          next();
        }
      })
    })
  },

  handleError: function(err, req, res, next) {
    res.statusCode = err.status || 500;
    next();
  },


  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated() && req.user) { next(); return; }
    console.log(req);
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="' + "myrealm" + '"');
    res.end('Unauthorized');
    //next(); // ???
  }

}
