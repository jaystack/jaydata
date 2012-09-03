
var q = require('q')
    , mongodb =  $data.mongoDBDriver || require('mongodb')
    , Db = mongodb.Db
    , Server = mongodb.Server;

var contextAuthData = require('../fileload.js').LoadJson('./amazon.pwd.js', { data: { name: 'mongoDB', databaseName: 'admin', address: 'db1.storm.jaystack.com', port: 8888, username: 'admin', password: 'admin' } }).data;

module.exports = {

    adduser: function(db, username, password, callback) {
        db.admin(function(err, admindb) {
            if (err) callback(err);
            else admindb.authenticate('admin', 'admin', function(err, result) {
                if (err) callback(err);
                else db.addUser(username, password, function(err, result) {
                    if (err) callback(err);
                    else callback(null, db);
                })
            });
        });
    },

    createQueryableDB: function(dbname, username, password, callback) {
	var self = this;
        console.log(arguments);
        var newdb = new Db(dbname, new Server(contextAuthData.address, contextAuthData.port, {}));
        newdb.open(function(err, db) {
            if (err) callback(err);
            else self.adduser(db, username, password, callback);
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
    },

    restore: function (newDbName, config) {
        var connection = config.servers;
        var appDumpPath = config.AppDbDump;
        var defer = q.defer();

        var child_process = require('child_process'); //TODO replica set
        child_process.exec('mongorestore -h ' + connection.address + ':' + connection.port + ' -u ' + connection.username + ' -p ' + connection.password + ' -d ' + newDbName + ' ' + appDumpPath,
            function (err, stdout, stderr) {
                if (err) {
console.log(err);
                    defer.reject(err);
                } else {
                    defer.resolve(stdout);
                }
            }
        );

        return defer.promise;
    },
}

