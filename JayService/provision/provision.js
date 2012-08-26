
var q = require('q');
var exec = require('exec');

var Db = require('mongodb').Db
    , Admin = require('mongodb').Admin
    , Connection = require('mongodb').Connection
    , Server = require('mongodb').Server
    , ReplSetServers = require('mongodb').ReplSetServers;


var mongoose = module.parent.exports.mongoose
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId;

var extend = require('mongoose-schema-extend');

var tokensrv = module.parent.exports.tokensrv;

var app = module.parent.exports.app;

var AppItemSchema = new Schema({
    appid: { type: String }
}, { collection : 'AppItems', discriminatorKey : 'type' });

var CUSchema = AppItemSchema.extend({
    instanceid: { type: String },
    name: { type: String },
    ip: { type: String }
});

var FileRepoSchema = AppItemSchema.extend({
    quota: { type: Number }
});

var QueryableDBSchema = AppItemSchema.extend({
    dbid: { type: String },
    dbname: { type: String },
    maxrecord: { type: Number }
});

var AppItem = mongoose.model('appitem', AppItemSchema);
var CUItem = mongoose.model('cu', CUSchema);
var FileRepoItem = mongoose.model('filerepo', FileRepoSchema);
var QueryableDbItem = mongoose.model('qdb', QueryableDBSchema);

var types = { 'ComputeUnits': createComputeUnit, 'FileRepo': createFileRepo, 'QueryableDB': createQueryableDB };

function launch(appid) {
    var tag = 'Name:'+appid;
    exec(['launch_instance', '-g', 'application', '-a', 'ami-e901069d', '-t', 't1.micro', '-r', 'eu-west-1', '-z', 'eu-west-1b',
        '-T', tag, '-k', 'jaystack', '-d', '~/.boto'], function(err, out, exitcode) {
        if (err) throw err;

    });

    // Public DNS name: ec2-46-51-157-43.eu-west-1.compute.amazonaws.com
    // Private DNS name: ip-10-228-89-130.eu-west-1.compute.internal
}

function createComputeUnit(req) {

    var appitem = new CUItem({
        id: req.body._id,
        appid: req.body.appid,
        test: req.body.test
    });
    if (appitem.test == false) {
        //ip = launch(req.body.appid);
        console.log("launch");
    }

    return appitem;
}

function createFileRepo(req) {
    var appitem = new FileRepoItem({
        id: req.body._id,
        appid: req.body.appid,
        quota: req.body.quota
    });
    return appitem;
}

function createQueryableDB(req) {
    var appitem = new QueryableDbItem({
        id: req.body._id,
        appid: req.body.appid,
        dbid: req.body.dbid,
        dbname: req.body.dbname,
        maxrecord: req.body.maxrecord
    });
    var newdb = new Db('my_database', new Server('db1.storm.jaystack.com', 8888, { auto_reconnect: true }), {});
    newdb.open(function(err,db) {
        db.admin(function(err, admindb) {
            admindb.authenticate('admin', 'admin', function(err, result) {
                db.addUser('x','y', function(err, result) {
                });
            })
        });
    });
    return appitem;
}

function createAppItem(req, res) {
    var defer = q.defer();
    var fn = types[req.body.type];
    if (fn == null) {
        // TODO do something if no such type
    }
    /*
     q.fcall(fn(req))
     .then(save)
     .then(defer.resolve())
     .fail(defer.reject())
     .end();
     */
    item = fn(req); // ez igy nem ok mert nem async fut
    item.save(function (err) {
        if (!err) {
            defer.resolve();
        } else {
            defer.reject(err);
        }
    });
    return defer.promise;
}

app.post('/addappitem', function (req, res){
    // kiszedni az appownert es hozzacsapni a kereshez
    var promise = createAppItem(req, res);
    q.when(promise)
        .then(function(result) {
            tokensrv.set(req.token, { status: 'Done', result: 'Succeeded' });
        })
        .fail(function(reason) {
            tokensrv.set(req.token, { status: 'Done', result: 'Failed', reason: reason });
        })
    res.end(JSON.stringify(tokensrv.get(req.token)));
});

/* {
 "_id":"6150664a-31a3-4800-a832-74ad7770133a",
 "type":"QueryableDB",
 "parametername":"DatabaseSize",
 "parametervalue":"3",
 "method":"ChangeAppItem",
 "token":"bfe64c66-35be-40a4-95a2-49c5a26cbbb0"
 } */
app.post('/changeappitem', function (req, res){
    tokensrv.set(req.token, { status: 'Done', result: 'Succeeded' });
    res.end(JSON.stringify(tokensrv.get(req.token)));
});
/* {
 "_id":"f463ee3e-b397-4dbd-9381-8f40bd0a5c86",
 "type":"ComputeUnits",
 "method":"RemoveAppItem",
 "token":"cb1eafb6-d628-440f-b5ef-f09986922318"
 }*/
app.post('/removeappitem', function (req, res){
    tokensrv.set(req.token, { status: 'Done', result: 'Succeeded' });
    res.end(JSON.stringify(tokensrv.get(req.token)));
});

app.post('/stopappitem', function (req, res){
    tokensrv.set(req.token, { status: 'Done', result: 'Succeeded' });
    res.end(JSON.stringify(tokensrv.get(req.token)));
});

app.post('/restartappitem', function (req, res){
    tokensrv.set(req.token, { status: 'Done', result: 'Succeeded' });
    res.end(JSON.stringify(tokensrv.get(req.token)));
});

