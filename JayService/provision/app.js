
var q = require('q');

var $data = require('jaydata');

var express = require('express')
  , http = require('http');

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

//require('./lib/appowner');
//require('./lib/app');
//require('./lib/appitem');

var launch = require('./launch');
var provision = require('./provision');

q.when(provision.init())
    .then(function(x) {
        console.log('init ok'); return x;
    })
    .fail(function(reason) {
        console.log('init failed: ', reason);
    })
    .then(function(x) {
        return provision.provision('app1','1',{
            'dbname': {
                coll1: { x: 1 },
                coll2: { y :1 }
            },
            'dbname2': {
                coll3: { x: 1 },
                coll4: { y :1 }
            }
        });
    })
    .then(function(appid) {
        console.log('provisioning ok');
        return appid;
    })
    .fail(function(reason) {
        console.log('provisioninig failed: '+ reason);
    })
    //.then(function(appid) {
        //return launch.launch('app1');
    //})
    //.then(function(result) {
        //console.log('launch ok: ', result);
        //console.log(result);
    //})
    //.fail(function(reason) {
        //console.log('launch failed: '+ reason);
    //});
    ;


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

