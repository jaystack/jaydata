
var app = module.parent.exports.app
    , mongo = require('./mongo');
//var provision = require('./provision');
var q = require('q');

function addAppDb(ctx, instance) {
    /*return provision.createDatabase(ctx, instance, { Data: { name: 'ApplicationDB' } }, {})
    .then(function () {
        return mongo.restore();
    });*/
    var connection = require('../fileload.js').LoadJson('./amazon.pwd.js', {
        defaultDbServers: [{ address: '127.0.0.1', port: 1350, username: 'admin', password: 'admin' }],
        masterAppDbDumpPath: '',
    });
    var newDbName = instance.Id + '_ApplicationDB';

    return mongo.restore(newDbName, { AppDbDump: connection.masterAppDbDumpPath, servers: connection.data })
        //Add user
        .then(function () { return q.ncall(mongo.createQueryableDB, mongo, newDbName, instance.Username, instance.Password); });
}

function addApp(req, appowner) {
  var app = new $provision.Types.App({Id: req.body._id, AppOwnerId: req.body.appownerid, Name: req.body.name});
  return req.ctx.addapp(app, appowner);
}

function createApp(req, res) {
  return req.ctx.findAppOwnerById(req.body.appownerid)
    .then(function(appowner){return addApp(req, appowner);})
    .then(function(instance){return addAppDb(req.ctx, instance);});
}

function destroyApp(req, res) {
  return 'ok';
}

app.post('/addapp', function (req, res){
    module.parent.exports.tokenizedFunction(req, res, createApp);
});

app.post('/destroyapp', function (req, res){
    module.parent.exports.tokenizedFunction(req, res, destroyApp);
});

