
var q = require('q')
    , express = require('express')
    , http = require('http')
    , tokensrv = module.exports.tokensrv = require('./lib/tokensrv')
    , $data = require('jaydata');

require('./lib/model');

var contextAuthData = require('./fileload.js').LoadJson('./amazon.pwd.js', { data: { name: 'mongoDB', databaseName: 'admin', address: 'db1.storm.jaystack.com', port: 8888, username: 'admin', password: 'admin' } }).data;

var app = module.exports.app = express();
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(tokensrv.parseToken());
  app.use(function (req, res, next) {
      req.ctx = new $provision.Types.ProvisionContext(contextAuthData);
      req.ctx.onReady(function () {
          next();
      })
  });
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/check', function(req, res) {
  res.end("ok");
});

module.exports.tokenizedFunction = function(req, res, func) {
console.log(req.body);
    var promise = func(req, res);
    q.when(promise)
        .then(function(result) {
            tokensrv.set(req.token, { status: 'Done', result: 'Succeeded' });
        })
        .fail(function(reason) {
            tokensrv.set(req.token, { status: 'Done', result: 'Failed', reason: reason.message });
        })
    res.end(JSON.stringify(tokensrv.get(req.token)));
};

app.get('/gettokenstatus/:tokenid', function(req, res) {
    var token = tokensrv.get(req.params.tokenid);
    if (typeof token !== 'undefined' && token != null) {
        res.end(JSON.stringify(token));
    } else {
        res.statusCode = 404;
        res.end('no such token');
    }
});

require('./lib/provision');
require('./lib/appowner');
require('./lib/app');
require('./lib/appitem');
require('./lib/reserve');
require('./lib/launch');
require('./lib/notready');

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

