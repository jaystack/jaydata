///**
// * Created with JetBrains WebStorm.
// * User: zpace
// * Date: 7/19/12
// * Time: 12:28 PM
// * To change this template use File | Settings | File Templates.
// */
//
var c = require('connect');
//var passport = require('passport');
//var BasicStrategy = require('passport-http').BasicStrategy;
//
//var users = [
//    { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com' }
//    , { id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com' }
//];
//
//function findByUsername(username, fn) {
//    for (var i = 0, len = users.length; i < len; i++) {
//        console.log("authenticating");
//        var user = users[i];
//        if (user.username === username) {
//            return fn(null, user);
//        }
//    }
//    return fn(null, null);
//}
//
//passport.use(new BasicStrategy({
//    },
//    function(username, password, done) {
//        // asynchronous verification, for effect...
//        process.nextTick(function () {
//
//            // Find the user by username.  If there is no user with the given
//            // username, or the password is not correct, set the user to `false` to
//            // indicate failure.  Otherwise, return the authenticated `user`.
//            findByUsername(username, function(err, user) {
//                if (err) { return done(err); }
//                if (!user) { return done(null, false); }
//                if (user.password != password) { return done(null, false); }
//                return done(null, user);
//            })
//        });
//    }
//));
var app = c();
////app.use(function(req, res, next) {
////    next();
////})
////app.use(passport.initialize());
//var b = c.basicAuth( function(u,n) {
//    console.log("authing:" + u)
//    return true;
//});
//console.dir(b);
app.use("/", c["static"]("../"));
app.listen(80);
//var app2 = c();
//
//
//app2.use(function (req, res, next) {
//    res.setHeader('Access-Control-Allow-Credentials', 'true');
//    res.setHeader('Access-Control-Allow-Origin', 'http://localhost');
//    res.setHeader('Access-Control-Allow-Headers', 'X-PINGOTHER, Content-Type, MaxDataServiceVersion, DataServiceVersion');
//    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, MERGE');
//    if (req.method === 'OPTIONS') {
//        res.end();
//    } else {
//        next();
//    }
//});
//
////app2.use("/api", b);
////app2.use("/api", function(req,res) {
////    console.dir(req.user);
////    res.setHeader('Content-Type','application/json');
////    res.end(JSON.stringify({a: "b"}));
////})
////app2.listen(8888);
