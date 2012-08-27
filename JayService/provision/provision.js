
var q = require('q')
    , Db = require('mongodb').Db
    , Admin = require('mongodb').Admin
    , Connection = require('mongodb').Connection
    , Server = require('mongodb').Server
    , mongoose = module.parent.exports.mongoose
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId
    , uuid = require('node-uuid')
    , extend = require('mongoose-schema-extend');

var AppSchema = new Schema({
    appid: String,
    items: [{ type: Schema.Types.ObjectId, ref: 'appitems' }]
});

var AppItemSchema = new Schema({
    app: { type: Schema.Types.ObjectId, ref: 'apps' }
}, { collection : 'appitems', discriminatorKey : 'type' });

var CUSItemSchema = AppItemSchema.extend({
    instanceid: { type: String },
    size: String, // micro
    type: String  // reserved, ondemand, spot
});

var FileRepoItemSchema = AppItemSchema.extend({
    quota: { type: Number }
});

var ProvisionableAppItemSchema = AppItemSchema.extend({
    provisionID: String,
    name: String
});

var QueryableDBItemSchema = AppItemSchema.extend({
    dbid: { type: String },
    dbname: { type: String },
    maxrecord: { type: Number }
});

var AppInstanceSchema = new Schema({
    appid: String,
    app: { type: Schema.Types.ObjectId, ref: 'apps' },
    parentApp: { type: Schema.Types.ObjectId, ref: 'apps' },
    provision: { type: Schema.Types.ObjectId, ref: 'appitems' },
    hosts: [String],
    processLogin: String,
    processPassword: String,
    firewall: String,
    serviceLayer: String,
    applicationLayer: String,
    dataLayer: String,
    provision: String
});

var ProvisionedDbSchema = new Schema({
    appinstance: { type: Schema.Types.ObjectId, ref: 'appinstances' },
    qdb: { type: Schema.Types.ObjectId, ref: 'appitems' }, // TODO ne legyen ref hanem copy hogy ne valtozzon az appal ??
    dbname: String,
    username: String,
    password: String
});

var InventorySchema = new Schema({
    instanceid: String, // TODO should be unique key
    size: String, // micro
    type: String, // reserved, ondemand, spot
    used: Boolean,
    appID: String, // has value if this instance is in use
    cuID: String, // has value if this instance is in use
    lastModified: Date
});

var App = mongoose.model('apps', AppSchema)
    , AppItem = mongoose.model('appitems', AppItemSchema)
    , CUItem = mongoose.model('cu', CUSItemSchema)
    , FileRepoItem = mongoose.model('filerepo', FileRepoItemSchema)
    , QueryableDbItem = mongoose.model('qdb', QueryableDBItemSchema)
    , ProvisionableAppItem = mongoose.model('provisionableapp', ProvisionableAppItemSchema)
    , AppInstanceItem = mongoose.model('appinstances', AppInstanceSchema)
    , ProvisionedDbItem = mongoose.model('provisioneddbs', ProvisionedDbSchema)
    , InventoryItem = mongoose.model('inventory', InventorySchema);

function findApp(appid, callback) {
    App.findOne( { appid: appid }).populate('items').exec(function (err, app) {
        if (err || app == null) callback('no such app');
        else callback(err, app);
    });
}

function findAppInstance(appid, callback) {
    AppInstanceItem.findOne( { appid: appid }).populate('parentApp').exec(function (err, app) {
        if (err || app == null) callback('no such appinstance');
        else callback(err, app);
    });
}

function checkProvisionId(app, provisionid, callback) {
    if (app && app.items)
        app.items.forEach(function(item) {
            if (item.type == 'provisionableapp' && item.provisionID == provisionid) return callback(null, app);
        })
    callback(app); // 'not valid provisionid'
}

function checkDb(app, dbid, callback) {
    if (app && app.items)
        app.items.forEach(function(item) {
            if (item.type == 'qdb' && item.dbid == dbid) return callback(null, app);
        })
    callback(app); // 'no such db'
}

function createNewApp(parentapp, provisionid, newappid, callback) {
    // TODO
    var newappinstanceitem = new AppInstanceItem({
        appid : newappid,
        parentApp: parentapp._id,
        provisionID: provisionid
    });
    newappinstanceitem.save(function(err) {
        if (err) callback(err);
        else callback(null, [parentapp, newappinstanceitem]);
    });
}

function createDatabases(parentapp, newappinstance, username, password, callback) {
    if (!parentapp || !parentapp.items) return callback('no parent app');
    var dbz = [];
    var promise = q.resolve(1); // ?
    parentapp.items.forEach(function(item) {
        if (item.type == 'qdb') {
            var provisionedDbItem = new ProvisionedDbItem( {
                appinstance: newappinstance._id,
                qdb: item._id,
                dbname: newappinstance._id + '_' + item.dbname,
                username: username,
                password: password
            });
            promise = promise.then(function() { return q.ncall(createQueryableDB, this, provisionedDbItem); } )
                    .then(function(newdb) { dbz.push( { db: newdb, suffix: item.dbname } ); return newdb; } )
                    .then(function() { return q.ncall(provisionedDbItem.save, provisionedDbItem); });
        }
    });
    promise.then(function() { callback(null, [parentapp, newappinstance, dbz]); } )
        .fail(function(reason) { callback(reason); } );
}

function createQueryableDB(provisionedDbItem, callback) {
    var newdb = new Db(provisionedDbItem.dbname, new Server('localhost', 27017, {}));
    newdb.open(function(err, db) {
        if (err) callback(err);
        else db.admin(function(err, admindb) {
            if (err) callback(err);
            else admindb.authenticate('admin', 'admin', function(err, result) {
                if (err) callback(err);
                else db.addUser(provisionedDbItem.username, provisionedDbItem.password, function(err, result) {
                    if (err) callback(err);
                    else callback(null, newdb);
                });
            })
        });
    });
}

function initDatabase(parentapp, newappinstance, dbs, initdata, callback) {
    var promise = q.resolve(1); // ?
    dbs.forEach(function(d) {
        var init = initdata[d.suffix];
        if (init) {
            Object.keys(init).forEach(function(collname) {
                var initcolldata = init[collname];
                d.db.collection(collname, function(err, collection) {
                    if (err) callback(err);
                    else promise = promise.then(function() { return q.ncall(collection.insert, collection, initcolldata) });
                });
            });
        }
    });
    promise.then(function() { callback(null, [parentapp, newappinstance]); } )
        .fail(function(reason) { callback(reason); } );
}

function provisionImpl(appid, provisionid, initdata, newappid) {
    var defer = q.defer();
    q.ncall(findApp, this, appid)
        .then(function(app) { return q.ncall(checkProvisionId, this, app, provisionid); })
        .then(function(app) { return q.ncall(createNewApp, this, app, provisionid, newappid); })
        .spread(function(parentapp, newappinstance) { return q.ncall(createDatabases, this, parentapp, newappinstance, '1', '1'); })
        .spread(function(parentapp, newappinstance, dbs) { return q.ncall(initDatabase, this, parentapp, newappinstance, dbs, initdata); })
        .spread(function(parentapp, newappinstance) { defer.resolve(newappid); })
        .fail(function(reason) { defer.reject(reason); });
    return defer.promise;
}

function reserve(appinstance, callback) {
    callback(null, [appinstance, ['1', '2']]);
}

function launchImpl(appid) {
    var defer = q.defer();
    q.ncall(findAppInstance, this, appid)
//        .then(function(app) { console.log(JSON.stringify(app)); return app; })
        .then(function(appinstance) { return q.ncall(reserve, this, appinstance); })
        .spread(function(appinstance, instances) { defer.resolve(instances); return [appinstance, instances]; })
        .fail(function(reason) { defer.reject(reason); })
        .spread(function(appinstance, instances) {  console.log(appinstance); console.log(instances); });
    return defer.promise;
}

function saveitem(item, app, callback) {
    item.save(function(err) {
        if (err) callback(err);
        else {
            app.items.push(item);
            app.save(function(err) {
                if (err) callback(err);
                else callback(null, app);
            })
        }
    });
}

module.exports = {

    init: function() {
        return q.ncall(findApp, this, 'app1')
            .fail(function(reason) {
                var app = new App({appid: 'app1'});
                return q.ncall(app.save, app);
            })
            .then(function(apps) { if (apps instanceof Array) return apps[0]; else return apps; })
            .then(function(app) { return q.ncall(checkProvisionId, this, app, '1'); })
            .fail(function(app) {
                var p = new  ProvisionableAppItem({app: app._id, provisionID: '1', name: 'small'});
                return q.ncall(saveitem, this, p, app);
            })
            .then(function(app) { return q.ncall(checkDb, this, app, 'db1'); })
            .fail(function(app) {
                var qdb = new QueryableDbItem({
                    app: app._id,
                    dbid:'db1',
                    dbname: 'dbname',
                    maxrecord: 10000
                });
                return q.ncall(saveitem, this, qdb, app);
            })
            .then(function(app) { return q.ncall(checkDb, this, app, 'db2'); })
            .fail(function(app) {
                var qdb = new QueryableDbItem({
                    app: app._id,
                    dbid:'db2',
                    dbname: 'dbname2',
                    maxrecord: 10000
                });
                return q.ncall(saveitem, this, qdb, app);
            })
            .fail(function(reason) { console.log(reason); });
    },

    provision: function(appid, provisionid, initdata) {
        initdata = {
            'dbname': {
                coll1: { x: 1 },
                coll2: { y :1 }
            },
            'dbname2': {
                coll3: { x: 1 },
                coll4: { y :1 }
            }
        };
        var newappid = uuid.v4();
        return provisionImpl(appid, provisionid, initdata, newappid);
    },


    launch: function(appid) {
        return launchImpl(appid);
    }
}

// TODO hiba eseten takaritas ?
// TODO beszolni Balazsnak ha tortent provisionalas
// TODO giga json generalas
// TODO allocate instance
