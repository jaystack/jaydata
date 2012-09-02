var app = module.parent.exports.app;
var mongo = require('./mongo');
var q = require('q');

function createAppItem(req, res) {
    var itemtype = req.body.type;
    return req.ctx.findAppById(req.body.appid)
        .then(function (app) {
            var appitem = new $provision.Types.AppItem({Id:req.body._id, AppId:req.body.appid, Type:req.body.type});
            delete req.body._id;
            delete req.body.appid;
            delete req.body.type;
            delete req.body.token;
            delete req.body.method;
            appitem.Data = req.body.Data;
            return req.ctx.additem(appitem, app).then(function (x) {
                return [req.ctx, appitem, app];
            });
        })
        .spread(function (ctx, appitem, app) {
            return ctx.Instances
                .single(function (i) {
                    return i.AppId == this.Id && i.IsProvision == null;
                }, {Id:app.Id})
                .then(function (instance) {
                    console.dir(instance);
                    var contextAuthData = require('../fileload.js').LoadJson('./amazon.pwd.js', { data:{ name:'mongoDB', databaseName:'admin', address:'db1.storm.jaystack.com', port:8888, username:'admin', password:'admin' } }).data;
                    contextAuthData.databaseName = instance.Id + '_ApplicationDB';
                    contextAuthData.username = instance.Username;
                    contextAuthData.password = instance.Password;

                    console.log('1');
                    return new $provision.Types.ProvisionContext(contextAuthData).onReady().then(function (ctx2) {
                        console.log('y');
                        return [instance, ctx2]
                    });
                })
                .spread(function (instance, ctx2) {
                    ctx2.AppItems.add(appitem);
                    return ctx2.saveChanges()
                        .then(function (x) {
                            return instance;
                        });
                });
        })
        .then(function (instance) {
            if (itemtype != "QueryableDB") return;
            console.log(instance);
            console.log(req.body.Data);
            return req.ctx.createprovisioneddb(instance, req.body)
                .then(function (dbinstance) {
                    console.log('x');
                    return q.ncall(mongo.createQueryableDB, mongo, instance.Id + '_' + req.body.Data.dbname, instance.Username, instance.Password);
                });
        });
}
function changeAppItem(req, res) {
    return true;
}
function removeAppItem(req, res) {
    return true;
}
function startAppItem(req, res) {
    return true;
}
function stopAppItem(req, res) {
    return true;
}

app.post('/addappitem', function (req, res) {
    module.parent.exports.tokenizedFunction(req, res, createAppItem);
});
app.post('/changeappitem', function (req, res) {
    module.parent.exports.tokenizedFunction(req, res, changeAppItem);
});
app.post('/removeappitem', function (req, res) {
    module.parent.exports.tokenizedFunction(req, res, removeAppItem);
});
app.post('/startappitem', function (req, res) {
    module.parent.exports.tokenizedFunction(req, res, startAppItem);
});
app.post('/stopappitem', function (req, res) {
    module.parent.exports.tokenizedFunction(req, res, stopAppItem);
});

