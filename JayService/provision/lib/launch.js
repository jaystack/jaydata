
var q = require('q');

var app = module.parent.exports.app;
var defaultJayStacHost = '.jaystack.net';
var defaultDataBase = require('../fileload.js').LoadJson('./amazon.pwd.js', { defaultDbServers: [] }).defaultDbServers;

function genjson(context, app) {
    var json = {
        type: 'init-compute-unit',
        appOwner: app.AppOwnerId,
        application: {
            type: 'application',
            appID: app.Id,
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
    //serviceLayer
    //applicationLayer
    .then(function () {
        return context.CuInventories.filter(function (cu) { return cu.AppId == this.AppId; }, { AppId: app.Id }).select(function (cu) { return { awsInstanceID: cu.AWSId, publicAddress: cu.PublicAddress, type: "compute-unit" }; }).toArray()
            .then(function (cus) { json.application.applicationLayer.computeUnits = cus; });
    })
    //dataLayer
    .then(function () {
        return context.Instances.single(function (i) { return i.AppId == this.AppId && i.IsProvision == false }, { AppId: app.Id })
            .then(function (instance) {
                return context.DbInventories.filter(function (db) { return db.InstanceId == this.InstanceId }, { InstanceId: instance.Id }).toArray()
                    .then(function (dbs) {
                        for (var i = 0; i < defaultDataBase.length; i++) {
                            var defDb = defaultDataBase[i];
                            json.application.dataLayer.dbServer.push({
                                address: defDb.address,
                                port: defDb.port,
                                username: instance.Username,
                                password: instance.Password
                            });
                        }

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
                        appId: instance.AppId,
                        hosts: [instance.appID + defaultJayStacHost],
                        dataLayer: {
                            dbServer: []
                        }
                    }

                    for (var i = 0; i < defaultDataBase.length; i++) {
                        var defDb = defaultDataBase[i];
                        result.dataLayer.dbServer.push({
                            address: defDb.address,
                            port: defDb.port,
                            username: instance.Username,
                            password: instance.Password
                        });
                    }

                    apps.push(result);
                }
            })
    }).then(function () { return json; })
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

