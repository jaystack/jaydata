
var q = require('q');
var http = require('http');
require('./ApplicationDBContext.js');

var app = module.parent.exports.app;
var defaultJayStacHost = '.jaystack.net';
var config = require('../fileload.js').LoadJson('./amazon.pwd.js', { defaultDbServers: [], defaultCUAdminPort: 9999 });

function genjson(context, app) {
    var json = {
        type: 'init-compute-unit',
        appOwner: app.AppOwnerId,
        application: {
            type: 'application',
            //appID: app.Id,
            hosts: [app.Id + defaultJayStacHost],
            serviceLayer: {},
            applicationLayer: {},
            dataLayer: {
                dbServer: [],
                databases: []
            },
            provision: {
                applications: []
            }
        }
    };


    return context.onReady()
    //get hosts
    .then(function () {
        return context.AppHosts.filter(function (h) { return h.AppId == this.AppId }, { AppId: app.Id }).select('it.Host').toArray()
            .then(function (hostsNames) { json.application.hosts = json.application.hosts.concat(hostsNames); });
    })
    //applicationLayer
    .then(function () {
        return context.CuInventories.filter(function (cu) { return cu.AppId == this.AppId; }, { AppId: app.Id }).select(function (cu) { return { awsInstanceID: cu.AWSId, publicAddress: cu.PublicAddress, type: "compute-unit" }; }).toArray()
            .then(function (cus) { json.application.applicationLayer.computeUnits = cus; });
    })
    //dataLayer
    .then(function () {
        return context.Instances.single(function (i) { return i.AppId == this.AppId && i.IsProvision == false }, { AppId: app.Id })
            .then(function (instance) {
                json.application.appID = instance.Id;
                return context.DbInventories.filter(function (db) { return db.InstanceId == this.InstanceId }, { InstanceId: instance.Id }).toArray()
                    .then(function (dbs) {
                        for (var i = 0; i < config.defaultDbServers.length; i++) {
                            var defDb = config.defaultDbServers[i];
                            json.application.dataLayer.dbServer.push({
                                address: defDb.address,
                                port: defDb.port
                            });
                        }
                        json.application.dataLayer.dbUser = instance.Username;
                        json.application.dataLayer.dbPwd = instance.Password;

                        var database = json.application.dataLayer.databases;
                        for (var i = 0; i < dbs.length; i++) {
                            var db = dbs[i];
                            database.push({
                                type: 'database',
                                name: db.DbName/*,
                                dbServer: 'otherdbserver'*/
                            })
                        }
                    });
            });
    })
    //provisions
    .then(function () {
        return context.Instances.filter(function (i) { return i.AppId == this.AppId && i.IsProvision == true }, { AppId: app.Id }).toArray()
            .then(function (instances) {
                var apps = json.application.provision.applications;
                for (var i = 0; i < instances.length; i++) {
                    var instance = instances[i];

                    var result = {
                        type: 'application',
                        appId: instance.Id,
                        hosts: [instance.appID + defaultJayStacHost],
                        dataLayer: {
                            dbServer: [],
                            dbUser: instance.Username,
                            dbPwd: instance.Password
                        }
                    }

                    for (var i = 0; i < config.defaultDbServers.length; i++) {
                        var defDb = config.defaultDbServers[i];
                        result.dataLayer.dbServer.push({
                            address: defDb.address,
                            port: defDb.port
                        });
                    }

                    apps.push(result);
                }
            })
    })
    //serviceLayer
    .then(function(){
        return genServiceLayer(json)
            .then(function(serviceLayer){ json.application.serviceLayer = serviceLayer; });
    })
    //script call
    .then(function () {
        var defer = q.defer();
        var child_process = require('child_process'); //TODO replica set
        child_process.exec('r53.sh ' + json.application.hosts[0] + ' ' + json.application.applicationLayer.computeUnits.map(function (cu) { return cu.publicAddress }).join(','),
            function (err, stdout, stderr) {
                if (err) {
                    defer.reject(err);
                } else {
                    defer.resolve(stdout);
                }
            }
        );

        return q.promise;
    })
    //CUs init
    .then(function(){
        var cus = json.application.applicationLayer.computeUnits;
        var data = JSON.stringify(json);
        for (var i = 0; i < cus.length; i++){
            send({
                host: cus[i].publicAddress,
                port: config.defaultCUAdminPort,
                path: '/make',
                method: 'POST',
                headers: { 'content-type': 'application/json' }
            }, data);
        }
    })
    .then(function () { return json; })
}

app.post('/launch', function (req, res) {
    req.ctx.Apps.single(function (app) { return app.Id == this.Id }, { Id: req.body.appid })
        .then(function (app) {
            return genjson(req.ctx, app).then(function (json) { console.log(JSON.stringify(json, null, '  ')); res.end(JSON.stringify(json)); }).fail(function (ex) { res.end(JSON.stringify(ex.message)); })
        });
});

// ez csak nem provisionalt app eseten fut le
// provisionalas eseten a launch automatikus
function launchImpl(appid) {
    var defer = q.defer();
    q.ncall(model.findApp, model, appid)
//        .then(function(app) { console.log(JSON.stringify(app)); return app; })
        .then(function(app) { return q.ncall(reserve, this, app); })
//        .then(function(x) { console.log(x); return x; })
        .spread(function(app, instances) { defer.resolve(instances); return [app, instances]; })
        .fail(function (reason) { defer.reject(reason); throw reason; })
        .spread(function(app, instances) {  return genjson(app, instances); })
        .then(function(x) { console.log(JSON.stringify(x)); })
    return defer.promise;
}

module.exports = {

    // nem provisionalt alkalmazas eseten
    launch: function(appid) {
        return launchImpl(appid);
    }

}

function genServiceLayer(json){
    var defer = q.defer();
    
    var json = json || { application: {} };
    if (!json.application.appID){
        defer.reject('Missing AppID');
        return defer.promise;
    }
    var inst = json.application.dataLayer.databases.filter(function(it){ return it.name == 'ApplicationDB'; })[0];
    if (!inst){
        defer.reject('Missing ApplicationDB');
        return defer.promise;
    }
    
    json.application.serviceLayer = {
        services: []
    };
    
    var cfg = {
        name: 'mongoDB',
        databaseName: json.application.appID + '_ApplicationDB',
        server: inst.dbServer || json.application.dataLayer.dbServer,
        username: inst.dbUser || json.application.dataLayer.dbUser,
        password: inst.dbPwd || json.application.dataLayer.dbPwd
    };
    var context = new $data.JayStormAPI.Context(cfg);
    var Q = require('q');
    Q.allResolved([context.Services.toArray(), context.IngressIPRules.toArray(), context.IngressOriginRules.toArray(), context.Databases.toArray()]).then(function(v){
        var result = {
            Services: v[0].valueOf(),
            IngressRules: v[1].valueOf(),
            OutgressRules: v[2].valueOf(),
            Databases: v[3].valueOf()
        };
        for (var i = 0; i < result.Services.length; i++){
            var r = result.Services[i];
            var service = {
                type: 'service',
                allowAnonymous: r.AllowAnonymous,
                serviceName: r.Name,
                allowedSubPathList: r.Sets || ['*'],
                internalPort: 60000 + (r.Port || 80)
            };
            if (r.DatabaseID) service.database = result.Databases.filter(function(it){ return it.DatabaseID == r.DatabaseID; })[0].Name;
            if (r.BaseServiceID) service.extend = result.Services.filter(function(it){ return it.ServiceID == r.ServiceID; })[0].Name;
            if (r.ServiceSourceType && r.ServiceSource){
                service.sourceType = r.ServiceSourceType;
                service.source = r.ServiceSource;
            }
            var rules = result.IngressRules.filter(function(it){ return it.ObjectID == r.ServiceID; });
            if (rules.length || r.UseDefaultPort || r.UseSSL) service.ingress = [];
            if (r.AllowAllIPs){
                var ports = rules.map(function(it){ return it.Port; });
                var processedPorts = [];
                if (r.UseDefaultPort){
                    service.ingress.push({
                        type: 'allow',
                        address: '*',
                        port: 80
                    });
                    if (r.UseSSL){
                        service.ingress.push({
                            type: 'allow',
                            address: '*',
                            port: 443,
                            ssl: true
                        });
                    }
                }else{
                    for (var i = 0; i < ports.length; i++){
                        if (processedPorts.indexOf(ports[i]) < 0){
                            processedPorts.push(ports[i]);
                            service.ingress.push({
                                type: 'allow',
                                address: '*',
                                port: ports[i]
                            });
                        }
                    }
                }
            }else{
                for (var j = 0; j < rules.length; j++){
                    var ir = rules[j];
                    service.ingress.push({
                        type: 'allow',
                        address: ir.SourceAddress,
                        port: r.UseDefaultPort ? 80 : ir.Port,
                        ssl: ir.SSL
                    });
                    if (r.UseSSL){
                        service.ingress.push({
                            type: 'allow',
                            address: ir.SourceAddress,
                            port: 443,
                            ssl: true
                        });
                    }
                }
            }
            if (r.AllowAllOrigins){
                service.outgress = [{
                    type: 'allow',
                    origin: '*'
                }];
            }else{
                service.outgress = result.OutgressRules.map(function(it){
                    return {
                        type: 'allow',
                        origin: it.SourceOrigin,
                        method: it.Method || ['GET']
                    };
                });
                if (!service.outgress.length) delete service.outgress;
            }
            /*if (r.UseDefaultPort){
                service.ingress.push({
                    type: 'allow',
                    address: '*',
                    port: 80
                });
            }
            if (r.UseSSL){
                service.ingress.push({
                    type: 'allow',
                    address: '*',
                    port: 443,
                    ssl: true
                });
            }*/
            json.application.serviceLayer.services.push(service);
        }
        defer.resolve(json.application.serviceLayer);
    }).fail(function(v){
        console.log(v);
        defer.reject('JSON build error');
    });
    
    return defer.promise
}

function send(options, data, callback){
    var req = http.request(options, function(res){
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function(chunk){
            data += chunk;
        });
        res.on('end', function(){
            (callback || console.log)(data);
        });
    });

    req.on('error', function(err){
        throw err;
    });
    req.write(data);
    req.end();
}
