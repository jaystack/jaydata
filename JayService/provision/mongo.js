
var q = require('q')
    , mongodb =  $data.mongoDBDriver || require('mongodb')
    , Db = mongodb.Db
    , Admin = mongodb.Admin
    , Connection = mongodb.Connection
    , Server = mongodb.Server;

module.exports = {

    createQueryableDB: function(dbname, username, password, callback) {
        var newdb = new Db(dbname, new Server('localhost', 27017, {}));
        newdb.open(function(err, db) {
            if (err) callback(err);
            else db.admin(function(err, admindb) {
                if (err) callback(err);
                else admindb.authenticate('admin', 'admin', function(err, result) {
                    if (err) callback(err);
                    else db.addUser(username, password, function(err, result) {
                        if (err) callback(err);
                        else callback(null, newdb);
                    });
                })
            });
        });
    },

    initDatabase: function (dbs, initdata, callback) {
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
}

