
var q = require('q');
var http = require('http');
require('./ApplicationDBContext.js');

var app = module.parent.exports.app;
var defaultJayStacHost = '.jaystack.net';
var config = require('../fileload.js').LoadJson('./amazon.pwd.js', { defaultDbServers: [], defaultCUAdminPort: 9999, routeConf: {} });

function genjson(context, app) {
    var json = {
        type: 'init-compute-unit',
        appOwner: app.AppOwnerId,
        application: {
            type: 'application',
            //appID: app.Id,
            hosts: [app.Id + defaultJayStacHost],
            serviceLayer: {},
            applicationLayer: {
                computeUnits: []
            },
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
    .then(function () {
        return q.allResolved([
            context.AppHosts.filter(function (h) { return h.AppId == this.AppId }, { AppId: app.Id }).select('it.Host').toArray(),
            context.CuInventories/*.filter(function (cu) { return cu.AppId == this.AppId; }, { AppId: app.Id })*/.toArray(),
            context.Instances.filter(function (i) { return i.AppId == this.AppId }, { AppId: app.Id }).toArray(),
            context.DbInventories.toArray(),
            context.AppItems.toArray()
        ]).then(function (v) {
            var result = {
                AppHosts: v[0].valueOf(),
                CuInventories: v[1].valueOf(),
                Instances: v[2].valueOf(),
                DbInventories: v[3].valueOf(),
                AppItems: v[4].valueOf()
            };

            //Apphosts
            json.application.hosts = json.application.hosts.concat(result.AppHosts);

            //applicationLayer
            for (var i = 0; i < result.CuInventories.length; i++) {
                var cu = result.CuInventories[i];
                for (var j = 0; j < result.AppItems.length; j++) {
                    var appItem = result.AppItems[j];

                    if (cu.AppItemId === appItem.Id) {
                        json.application.applicationLayer.computeUnits.push({
                            awsInstanceID: cu.AWSId,
                            publicAddress: cu.PublicAddress,
                            privateAddress: cu.PrivateAddress,
                            type: "compute-unit"
                        });
                        break;
                    }
                }
            }

            for (var j = 0; j < result.Instances.length; j++) {
                var instance = result.Instances[j];

                //dataLayer
                if (instance.IsProvision !== true) {
                    json.application.appID = instance.Id;
                    json.application.dataLayer.dbUser = instance.Username;
                    json.application.dataLayer.dbPwd = instance.Password;

                    for (var i = 0; i < config.defaultDbServers.length; i++) {
                        var defDb = config.defaultDbServers[i];
                        json.application.dataLayer.dbServer.push({
                            address: defDb.address,
                            port: defDb.port
                        });
                    }

                    var database = json.application.dataLayer.databases;
                    var dbs = result.DbInventories.filter(function (dbInv) { return dbInv.InstanceId === instance.Id });
                    for (var i = 0; i < dbs.length; i++) {
                        var db = dbs[i];
                        database.push({
                            type: 'database',
                            name: db.DbName/*,
                            dbServer: 'otherdbserver'*/
                        })
                    }


                }
                    //provisions
                else {
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

                    json.application.provision.applications.push(result);
                }

                console.log(JSON.stringify(json, null, '  '));
            }

        })

    })
    //serviceLayer
    .then(function () {
        return genServiceLayer(json)
            .then(function (serviceLayer) { json.application.serviceLayer = serviceLayer; });
    })
    //script call
    .then(function () {
        var defer = q.defer();
        var child_process = require('child_process'); //TODO replica set
        child_process.exec('r53.sh ' + config.routeConf.username + ' ' + config.routeConf.password + ' ' + json.application.hosts[0] + ' ' + json.application.applicationLayer.computeUnits.map(function (cu) { return cu.publicAddress }).join(','),
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
    .then(function () {
        var cus = json.application.applicationLayer.computeUnits;
        var data = JSON.stringify(json);
        for (var i = 0; i < cus.length; i++) {
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

function genServiceLayer(json) {
    var defer = q.defer();

    var json = json || { application: {} };
    if (!json.application.appID) {
        defer.reject('Missing AppID');
        return defer.promise;
    }
    var inst = json.application.dataLayer.databases.filter(function (it) { return it.name == 'ApplicationDB'; })[0];
    if (!inst) {
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
    Q.allResolved([context.Services.toArray(), context.IngressIPRules.toArray(), context.IngressOriginRules.toArray(), context.Databases.toArray()]).then(function (v) {
        var result = {
            Services: v[0].valueOf(),
            IngressRules: v[1].valueOf(),
            OutgressRules: v[2].valueOf(),
            Databases: v[3].valueOf()
        };
        for (var i = 0; i < result.Services.length; i++) {
            var r = result.Services[i];
            var service = {
                type: 'service',
                allowAnonymous: r.AllowAnonymous,
                serviceName: r.Name,
                allowedSubPathList: r.Sets || ['*'],
                internalPort: 60000 + (r.Port || 80)
            };
            if (r.DatabaseID) service.database = result.Databases.filter(function (it) { return it.DatabaseID == r.DatabaseID; })[0].Name;
            if (r.BaseServiceID) service.extend = result.Services.filter(function (it) { return it.ServiceID == r.ServiceID; })[0].Name;
            if (r.ServiceSourceType && r.ServiceSource) {
                service.sourceType = r.ServiceSourceType;
                service.source = r.ServiceSource;
            }
            var rules = result.IngressRules.filter(function (it) { return it.ObjectID == r.ServiceID; });
            if (rules.length || r.UseDefaultPort || r.UseSSL) service.ingress = [];
            if (r.AllowAllIPs || !rules.length) {
                var ports = rules.map(function (it) { return it.Port; });
                var processedPorts = [];
                if (r.UseDefaultPort) {
                    service.ingress.push({
                        type: 'allow',
                        address: '*',
                        port: 80
                    });
                    if (r.UseSSL) {
                        service.ingress.push({
                            type: 'allow',
                            address: '*',
                            port: 443,
                            ssl: true
                        });
                    }
                } else {
                    for (var i = 0; i < ports.length; i++) {
                        if (processedPorts.indexOf(ports[i]) < 0) {
                            processedPorts.push(ports[i]);
                            service.ingress.push({
                                type: 'allow',
                                address: '*',
                                port: ports[i]
                            });
                        }
                    }
                }
            } else {
                for (var j = 0; j < rules.length; j++) {
                    var ir = rules[j];
                    service.ingress.push({
                        type: 'allow',
                        address: ir.SourceAddress,
                        port: r.UseDefaultPort ? 80 : ir.Port,
                        ssl: ir.SSL
                    });
                    if (r.UseSSL) {
                        service.ingress.push({
                            type: 'allow',
                            address: ir.SourceAddress,
                            port: 443,
                            ssl: true
                        });
                    }
                }
            }
            if (r.AllowAllOrigins || !result.OutgressRules.length) {
                service.outgress = [{
                    type: 'allow',
                    origin: '*'
                }];
            } else {
                service.outgress = result.OutgressRules.map(function (it) {
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
    }).fail(function (v) {
        console.log(v);
        defer.reject('JSON build error');
    });

    return defer.promise
}

function send(options, data, callback) {
    var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            (callback || console.log)(data);
        });
    });

    req.on('error', function (err) {
        throw err;
    });
    req.write(data);
    req.end();
}
