
var q = require('q')
    , uuid = require('node-uuid')
    , mongo = require('./mongo');

var app = module.parent.exports.app;

//function createDatabaseImpl(ctx, instance, db, initdata) {
  //return ctx.createprovisioneddb(instance, db)
    //.then(function (dbinstance) { return q.ncall(mongo.createQueryableDB, mongo, instance.Id + '_' + dbinstance.DbName, instance.Username, instance.Password); })
    //.then(function(mongodb) { return q.ncall(mongo.initDatabase, mongo, {"db":mongodb,"suffix":db.Data.dbname}, initdata); });
//}

//function provisionDbImpl(instance, initdata) {
    //var defer = q.defer();
    //ctx.findDbs(instance.AppId)
	//.then(function(dbs) {
    	    //var promise = q.resolve(1); // ?
	    //dbs.forEach(function(db) {
		//promise = promise.then(function(x){return createDatabaseImpl(instance, db, initdata); });
	    //});
	    //promise.then(function(x){defer.resolve(1);})
		   //.fail(function(reason){defer.reject(reason);});
	//});
    //return defer.promise;
//}

//module.exports = {

    //createDatabase:function(ctx, instance, db, initdata) {
    	//return createDatabaseImpl(ctx, instance, db, initdata);
    //}
//}

//app.post('/provision', function (req, res){
 // req.ctx.findAppByName(req.body.appid)
    // TODO put back .then(function(app) { return q.ncall(model.checkProvisionId, model, app, provisionid).then(function(x){ return app;}); })
  //  .then(function(app) { return ctx.createinstance(app, provisionid); })
   // .then(function(instance) { return provisionDbImpl(instance,initdata); })
    //.then(function(x) { res.end(x); });
//});

// TODO hiba eseten takaritas ?
// TODO beszolni Balazsnak ha tortent indulas/leallas
// TODO giga json generalas
// TODO allocate instance nem kell provision eseten

