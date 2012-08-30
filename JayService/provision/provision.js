
var q = require('q')
    , model = require('./model')
    , uuid = require('node-uuid')
    , mongo = require('./mongo');

var ctx = new $provision.Types.ProvisionContext({name: 'mongoDB', databaseName: 'admin', address:'localhost' });

function createDatabases(app, instance) {
    var defer = q.defer();
    var dbz = [];
    ctx.findDbs(app)
	.then(function(dbs) {
    	    var promise = q.resolve(1); // ?
	    dbs.forEach(function(db) {
		promise = promise
		.then(function(x){ return ctx.createprovisioneddb(instance, db); })
		.then(function(dbinstance) { return q.ncall(mongo.createQueryableDB, mongo, dbinstance.DbName, instance.username, instance.password); });
	    });
	    promise.then(function(x){defer.resolve(dbz);})
		   .fail(function(reason){defer.reject(reason);});
	});
    return defer.promise;
}

function provisionImpl(appid, provisionid, initdata, newappid, username, password) {
    var defer = q.defer();
    q.ncall(ctx.findAppByName, ctx, appid)
        // TODO put back .then(function(app) { return q.ncall(model.checkProvisionId, model, app, provisionid).then(function(x){ return app;}); })
        .then(function(app) {
		// ez az altalunk generalt technikai username, password a mongo elereshez
	    return ctx.createinstance(app, username, password);
	})
        .then(function(instance) { return q.ncall(createDatabases, this, instance); })
//        .spread(function(parentapp, newappinstance, dbs) { return q.ncall(mongo.initDatabase, mongo, parentapp, newappinstance, dbs, initdata); })
        .then(function(x) { defer.resolve(newappid); })
        .fail(function(reason) { defer.reject(reason); });
    return defer.promise;
}

module.exports = {

    init: function() { return require('./init').init(); },

    // reserve es launch is egyben
    provision: function(appid, provisionid, initdata) {
        var newappid = uuid.v4();
        return provisionImpl(appid, provisionid, initdata, newappid);
    }

}

// TODO hiba eseten takaritas ?
// TODO beszolni Balazsnak ha tortent provisionalas
// TODO giga json generalas
// TODO allocate instance nem kell provision eseten

