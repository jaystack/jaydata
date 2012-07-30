require('mongodb');
var $data = require('jaydata');
var ua = require('ua-parser');
var express = require('express');

var app = express.createServer();

require('../mongoDBStorageProvider.js');

$data.Entity.extend('$log.Request', {
    Id: { type: 'int', computed: true, key: true },
    Timestamp: { type: 'datetime' },
    IPAddress: { type: 'string' },
    Url: { type: 'string' },
    Method: { type: 'string' },
    Browser: { type: 'string' }
});

$data.EntityContext.extend('$log.Context', {
    Logs: { type: $data.EntitySet, elementType: $log.Request }
});

$data.logger = function(url){
    return function(req, res, next){
        if (!req.url.match(new RegExp('^' + url))){
            next();
            return;
        }
        var it = new $log.Request({
            Timestamp: new Date(),
            IPAddress: req.headers && req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'] : req.connection.remoteAddress,
            Url: req.url,
            Method: req.method,
            Browser: ua.parse(req.headers['user-agent']).toString()
        });
        $log.context = new $log.Context({ name: 'mongoDB', databaseName: 'log' });
        $log.context.onReady(function(db){
            $log.context.Logs.add(it);
            $log.context.saveChanges(function(cnt){
                console.log('saved', cnt);
                next();
            });
        });
    };
};

app.use($data.logger('/'));
app.use(express.static(__dirname));
app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));

app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.engine('.html', require('jqtpl').express.compile);

app.get('/log', function(req, res){
    res.render('log');
});

app.get('/log/clear', function(req, res){
    $log.context = new $log.Context({ name: 'mongoDB', databaseName: 'log' });
    $log.context.onReady(function(db){
        db.Logs.toArray(function(data){
            for (var i = 0; i < data.length; i++){
                db.Logs.remove(data[i]);
            }
            
            //console.log('context', db);
            console.log(data);

            db.saveChanges(function(cnt){
                console.log('removed log entries', cnt);
                //console.log('context', db);
                res.render('log');
            });
        });
    });
});

app.get('/log/query', function(req, res){
    $log.context = new $log.Context({ name: 'mongoDB', databaseName: 'log' });
    $log.context.onReady(function(db){
        var query = db.Logs;
        if (req.query.$from) query = query.filter(function(it){ return it.Timestamp >= this.from; }, { from: new Date(req.query.$from) });
        if (req.query.$to) query = query.filter(function(it){ return it.Timestamp < this.to; }, { from: new Date(req.query.$to) });
        if (req.query.$filter && req.query.$value) query = query.filter('it.' + req.query.$filter + ' == ' + req.query.$value);
        if (req.query.$field && req.query.$contains) query = query.filter('it.' + req.query.$field + '.contains("' + req.query.$contains + '")');
        if (req.query.$field && req.query.$startswith) query = query.filter('it.' + req.query.$field + '.startsWith("' + req.query.$startswith + '")');
        if (req.query.$orderby) query = query[req.query.$dir == 'desc' ? 'OrderByDescending' : 'OrderBy']('it.' + req.query.$orderby);
        else query = query.orderByDescending('it.Timestamp');
        query = query.map(function(it){ return { Timestamp: it.Timestamp, IPAddress: it.IPAddress, Url: it.Url, Method: it.Method, Browser: it.Browser }; })
        if (req.query.$skip) query = query.skip(req.query.$skip);
        if (req.query.$take) query = query.take(req.query.$take);
        else query = query.take(100);
        query.toArray(function(data){
            res.contentType('application/json');
            res.send(data);
        });
    });
});

app.listen(8080);
