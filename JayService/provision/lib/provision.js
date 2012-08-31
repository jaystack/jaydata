
var q = require('q')
    , model = module.parent.exports.model || require('./model')
    , uuid = require('node-uuid')
    , mongo = require('./mongo');

var ctx = new $provision.Types.ProvisionContext({name: 'mongoDB', databaseName: 'admin', address:'localhost' });

var app = module.parent.exports.app;

function createDatabases(instance) {
    var defer = q.defer();
    var dbz = [];
    ctx.findDbs(instance.AppId)
	.then(function(dbs) {
    	    var promise = q.resolve(1); // ?
	    dbs.forEach(function(db) {
		promise = promise
		.then(function(x){ return ctx.createprovisioneddb(instance, db); })
		.then(function(dbinstance) { return q.ncall(mongo.createQueryableDB, mongo, dbinstance.DbName, instance.username, instance.password); })
		.then(function(newdb) { dbz.push({db:newdb, suffix:db.Data.name}); return newdb;});
	    });
	    promise.then(function(x){defer.resolve(dbz);})
		   .fail(function(reason){defer.reject(reason);});
	});
    return defer.promise;
}

function provisionDbImpl(instance, initdata) {
  return createDatabases(instance)
     .then(function(dbz) { return q.ncall(mongo.initDatabase, mongo, dbz, initdata); })
}

function provisionImpl(appid, provisionid, initdata, username, password) {
    var defer = q.defer();
    ctx.findAppByName(appid)
        // TODO put back .then(function(app) { return q.ncall(model.checkProvisionId, model, app, provisionid).then(function(x){ return app;}); })
        .then(function(app) {
	    return ctx.createinstance(app, username, password);
	})
	.then(function(instance) { return provisionDbImpl(instance,initdata); })
        .then(function(x) { defer.resolve(x); })
        .fail(function(reason) { console.log(reason); defer.reject(reason); });
    return defer.promise;
}

module.exports = {

    // reserve es launch is egyben ??
    provision: function(appid, provisionid, initdata) {
        var newappid = uuid.v4();
        var username = uuid.v4();
        var password = uuid.v4();
        return provisionImpl(appid, provisionid, initdata, username, password);
    },

    provisionDb: function(instance, initdata) {
	return provisionDbImpl(instance, initdata);
    }

}

// TODO hiba eseten takaritas ?
// TODO beszolni Balazsnak ha tortent provisionalas
// TODO giga json generalas
// TODO allocate instance nem kell provision eseten

