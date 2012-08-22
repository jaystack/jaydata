require('jaydata');
var fs = require('fs');
require('../../JaySvcUtil/JaySvcUtil.js');

var connect = require('connect');
var app = connect();

require('../../Types/StorageProviders/mongoDB/ClientObjectID.js');
$data.ServiceBase.extend('ObjectIDFactory', {
    newObjectID: (function(){
        var id = new $data.storageProviders.mongoDB.mongoDBProvider.ClientObjectID().toString();
        //var ret = new Buffer(id, 'ascii').toString('base64');
        //console.log(new $data.mongoDBDriver.ObjectID.createFromHexString(new Buffer(ret, 'base64').toString('ascii')));
        return id;
    }).toServiceOperation().returns('string'),
    resetSeed: (function(){
        $data.storageProviders.mongoDB.mongoDBProvider.ClientObjectID.idSeed = 1;
    }).toServiceOperation()
});

var storm = require('../../JayService/StormFactory.js');
fs.exists('./service.js', function(exists){
    if (exists) require('./service.js');

    app.use(storm.contextFactory({
        apiUrl: 'http://localhost:3000/contextapi.svc',
        databases: [{ name: 'NewsReader' }],
        filename: './context.js'
    }));

    app.use(storm.serviceFactory({
        services: [{
            serviceName: 'newsreader',
            database: 'NewsReader',
            port: 53999
        }, {
            serviceName: 'newsreader2',
            extend: 'ObjectIDFactory',
            database: 'NewsReader',
            port: 53999
        }, {
            serviceName: 'ObjectIDFactory',
            port: 53999
        }],
        context: './context.js',
        filename: './service.js'
    }));

    app.use(function(req, res, next){
        require('./service.js');
        next();
    });

    app.listen(9999);
});
