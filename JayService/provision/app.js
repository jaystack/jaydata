
var express = require('express')
  , http = require('http');

var mongoose = module.exports.mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/admin');
//mongoose.connect('mongodb://admin:admin@db1.storm.jaystack.com:8888/admin');


var tokensrv = module.exports.tokensrv = require('./lib/tokensrv');

var app = module.exports.app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(tokensrv.parseToken());
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/check', function(req, res) {
  res.end("ok");
});

app.get('/gettokenstatus/:tokenid', function(req, res) {
    var token = tokensrv.get(req.params.tokenid);
    console.log(req.params.tokenid);
    console.log(token);
    if (typeof token !== 'undefined' && token != null) {
        res.end(JSON.stringify(token));
    } else {
        res.statusCode = 404;
        res.end('no such token');
    }
});

require('./lib/appowner');
require('./lib/app');
require('./lib/appitem');

var provision = require('./provision');

provision.init();
provision.provision('1','1','');

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


