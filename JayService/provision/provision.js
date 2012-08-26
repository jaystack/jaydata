
var q = require('q')
    , Db = require('mongodb').Db
    , Admin = require('mongodb').Admin
    , Connection = require('mongodb').Connection
    , Server = require('mongodb').Server
    , mongoose = module.parent.exports.mongoose
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId
    , uuid = require('node-uuid');

var InventorySchema = new Schema({
    instanceid: String, // TODO should be unique key
    size: String, // micro
    type: String, // reserved, ondemand, spot
    used: Boolean,
    appID: String, // has value if this instance is in use
    cuID: String, // has value if this instance is in use
    lastModified: Date
});

var AppSchema = new Schema({
    appID: String
});

var ProvisionableAppSchema = new Schema({
    appID: String,
    provisionID: String,
    name: String
});

var AppInstanceSchema = new Schema({
    appID: String,
    provisionID: String,
    parentAppID: String
});

var DbSchema = new Schema({
    appID: String,
    dbname: String
});

var ProvisionedDbSchema = new Schema({
    appID: String,
    dbname: String,
    username: String,
    password: String
});

var InventoryItem = mongoose.model('inventoryitem', InventorySchema);
var AppItem = mongoose.model('apps', AppSchema);
var ProvisionableAppItem = mongoose.model('provisionableapps', ProvisionableAppSchema);
var AppInstanceItem = mongoose.model('appinstances', AppInstanceSchema);
var DbItem = mongoose.model('dbs', DbSchema);
var ProvisionedDbItem = mongoose.model('provisioneddbs', ProvisionedDbSchema);

function checkProvisionId(appid, provisionid, callback) {
    ProvisionableAppItem.find( { appID: appid, provisionID: provisionid }, (function (err, items) {
        if (items.length == 0) callback('not valid provisionid');
        else callback(err, items);
    }));
}

function createNewApp(parentAppID, provisionid, newappid, callback) {
    var appinstanceitem = new AppInstanceItem( { appID : newappid, provisionID: provisionid, parentAppID: parentAppID } );
    appinstanceitem.save(callback);
}

function createDatabases(parentAppID, newappid, username, password, callback) {
    DbItem.find({appID: parentAppID}, function(err, dbs) {
        if (err) callback(err);
        else {
            var dbz = [];
            var promise = q.resolve(1); // ?
            for (var i=0; i<dbs.length; i++) {
                var dbitem = dbs[i];
                var provisionedDbItem = new ProvisionedDbItem( {
                    appID: newappid,
                    dbname: newappid + '_' + dbitem.dbname,
                    username: username,
                    password: password
                });
                promise = promise.then(function() { return q.ncall(createQueryableDB, this, provisionedDbItem); } )
                        .then(function(newdb) { dbz.push( { db: newdb, suffix: dbitem.dbname } ); return newdb; } )
                        .then(function() { return q.ncall(provisionedDbItem.save, provisionedDbItem); });
            }
            promise.then(function() { callback(null, dbz); } )
                   .fail(function(reason) { callback(reason); } );
        }
    });
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
                    else {
                        callback(null, newdb);
                    }
                });
            })
        });
    });
}

function initDatabase(dbs, initdata, callback) {
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
    promise.then(function() { callback(null, dbs); } )
        .fail(function(reason) { callback(reason); } );
}

function provisionImpl(appid, provisionid, initdata, newappid) {
    var defer = q.defer();
    q.ncall(checkProvisionId, this, appid, provisionid)
        .then(function(result) { return q.ncall(createNewApp, this, appid, provisionid, newappid); })
        .then(function(result) { return q.ncall(createDatabases, this, appid, newappid, '1', '1'); })
        .then(function(dbs) { return q.ncall(initDatabase, this, dbs, initdata); })
        .then(function(result) { console.log('resolve'); defer.resolve(result); })
        .fail(function(reason) { console.log('reject'); defer.reject(reason); });
    return defer.promise;
}

module.exports = {

    init: function() {
        checkProvisionId('1', '1', function(err, ok) {
            if (err || ok.length == 0) {
                var provisionableAppItem = new ProvisionableAppItem({ appID: '1', provisionID: '1' });
                provisionableAppItem.save();
            }
        });
        DbItem.find(function(err, dbitems) {
            if (err || dbitems.length == 0) {
                var dbitem = new DbItem({appID: '1', dbname: 'alma' });
                dbitem.save();
            }
        });
    },

    provision: function(appid, provisionid, initdata) {

        initdata = {
            'alma': {
                coll1: { x: 1 },
                coll2: { y :1 }
            },
            'korte': {
                coll3: { x: 1 },
                coll4: { y :1 }
            }
        };

        var newappid = uuid.v4();
        var promise = provisionImpl(appid, provisionid, initdata, newappid);
        q.when(promise)
            .then(function(result) {
                console.log('provisioning ok: ' + result);
            })
            .fail(function(reason) {
                console.log('provisioninig failed: '+ reason);
            })
        return JSON.stringify({ newappid: newappid});
    }
}

// TODO hiba eseten takaritas ?
// TODO beszolni Balazsnak ha tortent provisionalas
