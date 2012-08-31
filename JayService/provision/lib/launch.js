
var q = require('q')
    , model = module.parent.exports.model || require('./model');

var app = module.parent.exports.app;

function reserve(app, callback) { // TODO ide majd kell optimistic locking
    var instances = [];
    model.InventoryItem.find(function (err, inventoryItems) {
        if (err) return callback(err);
        else {
            var promise = q.resolve(1); // ?
            app.items
                .filter(function(e, i, a) {
                    return (e.type == 'cu');
                })
                .forEach(function(item) {
                    var iitems = inventoryItems
                        .filter(function(e, i, a) {
                            return (e.cuID == item.cuid);
                        });
                    if (iitems.length > 1) { console.log('shit', iitems); } // error, should not happen !!
                    else if (iitems.length == 1) item.instance = iitems[0];
                    else {
                        var emptyInstances = inventoryItems
                            .filter(function(e, i, a) {
                                return (e.used == false);
                            });
                        if (emptyInstances.length == 0) return callback(null, [app, instances]);
                        var rinstance = emptyInstances[0];
                        rinstance.used = true;
                        rinstance.app = item.app;
                        rinstance.cuID = item.cuid;
                        item.instance = rinstance;
                        promise = promise.then(function(x) { return q.ncall(rinstance.save, rinstance); });
                    }
                    instances.push(item.instance);
                });
            q.when(promise)
                .then(function(x) { callback(null, [app, instances]); })
                .fail(function(reason) { callback(reason); });
        }
    });
}

function genjson(app, instances) {
    var json = {};
    json.type = 'init-compute-unit';
    json.appOwner = ''; // FIXME
    json.application = {};
    json.application.type = 'application';
    json.application.appID = app.appid;
    json.application.hosts = [ app.appid+'.jaystack.net']; // FIXME
    json.application.processLogin = ''; // FIXME
    json.application.processPassword = ''; // FIXME
    json.application.firewall = {
        type: "firewall",
        ingress: {
            allows: [
                {
                    type: "allow",
                    address: "195.7.12.12/12",
                    port: ["80"]
                },
                {
                    type: "allow",
                    address: "*",
                    port: ["80","1025","9999"]
                }
            ]
        },
        outgress: {
            allows: [
                {
                    type: "allow",
                    address: "facebook.com",
                    method: ["GET","POST","HEAD"]
                },
                {
                    type: "allow",
                    address: "*",
                    method: ["GET"]
                }
            ]
        }
    };
    json.application.serviceLayer = {
        services: [
            {
                type:"service",
                serviceName: "Database1Service",
                database: "Database1",
                port: 80,
                internalPort: 60080,
                publish: false
            },
            {
                type:"service",
                serviceName: "CustomService",
                port: 8080,
                ssl: true
            },
            {
                type:"service",
                serviceName: "CustomService2",
                extends: "Database1Service",
                database: "Database3",
                port: 8080
            }
        ]
    };
    json.application.applicationLayer = {
        type: ['micro', "|", 'small',"|","medium"],
        computeUnits: [
        {
            awsInstanceID: "spot1",
            type: "compute-unit",
            publicAddress: "",
            internalAddress: "127.0.0.1"
        },
        {
            awsInstanceID: "spot2",
            type: "compute-unit",
            publicAddress: "ip-address",
            internalAddress: "127.0.0.1"
        }]
    };
    json.application.dataLayer = {
        dbServer: "server1.local",
            databases: [{
            type: "database",
            name: "Database1"
        },{
            type: "database",
            name: "Database3",
            dbServer: "otherdbserver"
        }
        ]
    };
    json.application.provision = {
        applications: [
            {
                type: "application",
                appID: "guid2",
                hosts: [
                    "foobar.com",
                    "zoobar.net"
                ],
                dataLayer: {
                    dbServer: "server2.local"
                }
            }
        ]
    };
    return json;
}

// ez csak nem provisionalt app eseten fut le
// provisionalas eseten a launch automatikus
function launchImpl(appid) {
    var defer = q.defer();
    q.ncall(model.findApp, model, appid)
//        .then(function(app) { console.log(JSON.stringify(app)); return app; })
        .then(function(app) { return q.ncall(reserve, this, app); })
//        .then(function(x) { console.log(x); return x; })
        .spread(function(app, instances) { defer.resolve(instances); return [app, instances]; })
        .fail(function(reason) { defer.reject(reason); })
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
