
var q = require('q')
    , mongodb =  $data.mongoDBDriver || require('mongodb')
    , Db = mongodb.Db
    , Server = mongodb.Server;

module.exports = {

    createQueryableDB: function(dbname, username, password, callback) {
console.log(arguments);
        var newdb = new Db(dbname, new Server('localhost', 8888, {}));
        newdb.open(function(err, db) {
            if (err) callback(err);
            else db.admin(function(err, admindb) {
                if (err) callback(err);
                else admindb.authenticate('admin', 'admin', function(err, result) {
                    if (err) callback(err);
                    else db.addUser(username, password, function(err, result) {
                        if (err) callback(err);
                        else { console.log('created'); callback(null, newdb); }
                    });
                })
            });
        });
    },

    initDatabase: function (d, initdata, callback) {
        var promise = q.resolve(1); // ?
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
        promise.then(function() { callback(null, d); } )
            .fail(function(reason) { callback(reason); } );
    }
}

